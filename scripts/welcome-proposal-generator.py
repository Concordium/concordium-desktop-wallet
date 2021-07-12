# This script allows to generate welcome transfer proposals from a csv file exported from Excel.
# Run the script with one command line argument determining the path to that file.
# The expected format of that file is a UTF-8 csv file with:
# one row for each transfer, columns separated by ','
# The first column contains sender address, the second one the receiver address
# The third column contains amount of the release in GTU
# (as decimal with 6 digits after decimal dot and possibly using ',' as thousands separator)
#
# This script requires python 3.6 or above
#
# Note: The script uses dateutil and base58, which can be installed using 
# "pip install python-dateutil"
# "pip install base58"

import sys
import json
import csv
import os
import re
from decimal import *
from datetime import datetime,date,time
from dateutil.relativedelta import relativedelta
from base58 import b58decode_check

welcomeReleaseTime = datetime.fromisoformat("2021-07-15T14:00:00+01:00")
csvDelimiter = ','
thousandsSep = ','
decimalSep = '.'
assert thousandsSep not in decimalSep and decimalSep not in thousandsSep
maxAmount = 18446744073709551615
expiry = datetime.now() + relativedelta(hours =+ 2) # proposal expires 2 hours from now

# check that release is sufficiently long in the future, i.e., earliestReleaseTime = 08:00 CET tomorrow.
earliestReleaseTime = datetime.combine(date.today(), time.fromisoformat("08:00:00+01:00")) + relativedelta(days =+ 1)
if earliestReleaseTime > welcomeReleaseTime:
	print("Error: Release time for welcome transfer must not be earlier than 08:00 CET tomorrow.")
	sys.exit(5)


# Parses and validates the the amount.
# An amount_string is valid if stripped of leading and trailing whitespaces it 
# - Is a number with at most 6 decimal digits
# - Uses decimalSep as decimal separator
# - Optionally uses thousandsSep as thousand separator
# - Is >0 and <= maxAmount
# Parses the amount into its microGTU representation.
def parse_and_validate_amount(amount_string: str, row_number: int):
	amount_regex = r"^[0-9]+([.][0-9]{1,6})?$"
	amount_regex_with_1000_sep = r"^[0-9]{1,3}([,][0-9]{3})*([.][0-9]{1,6})?$"
	amount_org_string = amount_string
	#Strip white space and replace separators
	amount_string  = amount_string.replace(thousandsSep, ',').replace(decimalSep,'.').strip()
	#Ensure valid format
	if not bool(re.match(amount_regex, amount_string)) and not bool(re.match(amount_regex_with_1000_sep, amount_string)):
		print(f"Amount {amount_org_string} at row {row_number} is not a valid amount string.")
		print(f"Valid amounts are positive, use '{decimalSep}' as decimal separator, use '{thousandsSep}' as an optional thousand separator, and have at most 6 decimal digits.")
		print(f"E.g., 1{thousandsSep}000{thousandsSep}000{decimalSep}12 and 1000000{decimalSep}12 are valid amounts")
		raise ValueError("Invalid amount format.")
	#Remove thousand separator and replace decimal separator by .
	amount_string = amount_string.replace(thousandsSep, '').replace(decimalSep,'.')
	try: 
		amount = int(Decimal(amount_string) * 1000000)
	except: #this should not happen
		print(f"Amount {amount_org_string} at row {row_number} seems valid, but could not be converted to microGTU")
		raise ValueError("Could not convert amount.")
	#Check bounds
	if (amount > maxAmount):
		print(f"Amount {amount_org_string} at row {row_number} is greater than the maximum GTU possible for one release ({Decimal(maxAmount)/Decimal(1000000)}).")
		raise ValueError("Amount too large.")
	if (amount <= 0): 
		print(f"Amount {amount_org_string} at row {row_number} is zero or less, which is not allowed in a release schedule.")
		raise ValueError("Amount too small.")
	return amount

# Main function
def main():
	if len(sys.argv) != 2:
		print("Error: Incorrect number of arguments. Please provide the path to a csv file as the only argument.")
		sys.exit(1)

	csvFileName = sys.argv[1]

	# Extract base name of csv file without extension and path. Output files will contain this name.
	baseCsvName = os.path.splitext(os.path.basename(csvFileName))[0]

	# read csv file
	rowNumber = 0
	try:
		with open(csvFileName, newline='', encoding='utf-8-sig') as csvfile:
			reader = csv.reader(csvfile, delimiter=csvDelimiter)

			for row in reader:
				rowNumber += 1

				if len(row) != 3:
					print("Error: Incorrect file format. Each row must contains exactly 3 entires. Row ", rowNumber, " contains ", len(row), ".", sep='')
					sys.exit(2)

				senderAddress = row[0]
				try:
					b58decode_check(senderAddress)
				except:
					print("Encountered an invalid sender address: \"" + senderAddress + "\" at row " + str(rowNumber))
					sys.exit(2)

				receiverAddress = row[1]
				try:
					b58decode_check(receiverAddress)
				except:
					print("Encountered an invalid receiver address: \"" + receiverAddress + "\" at row " + str(rowNumber))
					sys.exit(2)

				# Remove thousands separator and trailing/leading whitespaces (if any)
				try:
					amount = parse_and_validate_amount(row[2], rowNumber)
				except ValueError as error:
					print(f"Error: {error}")
					sys.exit(2)

				proposal = {
					"sender": senderAddress,
					"nonce": "", # filled by desktop wallet
					"energyAmount": "", # filled by desktop wallet
					"estimatedFee": "", # filled by desktop wallet,
					"expiry": {
						"@type": "bigint",
						"value": int(expiry.timestamp())
					},
					"transactionKind": 19,
					"payload": {
						"toAddress": receiverAddress,
						"schedule": [{
							"amount": amount,
							"timestamp": int(welcomeReleaseTime.timestamp()) * 1000 # multiply with 1000 to convert to milliseconds
						}]
					},
					"signatures": {}
				}

				outFileName = "pre-proposal_" + baseCsvName + "_" + str(rowNumber).zfill(3) + ".json";
				try:
					with open(outFileName, 'w') as outFile:
						json.dump(proposal, outFile, indent=4)
				except IOError:
					print("Error writing file \"", outFileName, "\".", sep='')
					sys.exit(3)

	except IOError:
		print("Error reading file \"", csvFileName, "\".", sep='')
		sys.exit(3)

	print("Successfully generated", rowNumber, "proposals.")

if __name__ == "__main__":
	main()