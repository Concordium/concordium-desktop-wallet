# This script allows to generate welcome transfer proposals from a csv file exported from Excel.
# Run the script with one command line argument determining the path to that file.
# The expected format of that file is a UTF-8 csv file with:
# one row for each transfer, columns separated by ','
# The first column contains sender address, the second one the receiver address
# The third column contains amount of the release in GTU
# (as decimal with 6 digits after decimal dot and possibly using ',' as thousands separator)
#
# Note: The script uses dateutil and base58, which can be installed using 
# "pip install python-dateutil"
# "pip install base58"

import sys
import json
import csv
import os
from decimal import *
from datetime import datetime,date,time
from dateutil.relativedelta import relativedelta
from base58 import b58decode_check

welcomeReleaseTime = datetime.fromisoformat("2021-07-15T14:00:00+01:00")
csvDelimiter = ','
thousandsSep = ','
expiry = datetime.now() + relativedelta(hours =+ 2) # proposal expires 2 hours from now

# check that release is sufficiently long in the future, i.e., earliestReleaseTime = 08:00 CET tomorrow.
earliestReleaseTime = datetime.combine(date.today(), time.fromisoformat("08:00:00+01:00")) + relativedelta(days =+ 1)
if earliestReleaseTime > welcomeReleaseTime:
	print("Error: Release time for welcome transfer must not be earlier than 08:00 CET tomorrow.")
	sys.exit(5)


# Parses and validates the the amount.
# Validates that it has at most 6 decimals, is a positive number and 
# that it fits within a uint64. Parses the amount into its µGTU representation.
def parse_and_validate_amount(amountString: str, rowNumber: int):
	amountSplit = amountString.split(".")
	if (len(amountSplit) > 1 and (len(amountSplit) > 2 or len(amountSplit[1]) > 6)):
		print("An amount with more than 6 decimals, which cannot be resolved into a valid µGTU, was given: " + amountString + " at row " + str(rowNumber))
		sys.exit(2)

	if (not all(map(lambda x: x.isnumeric(),amountSplit))):
		print("An amount, which was not a valid number, was given: " + amountString + " at row " + str(rowNumber))
		sys.exit(2)

	amount = int(Decimal(amountString) * 1000000)
	if (amount > 18446744073709551615):
		print("An amount that is greater than the maximum GTU possible for one release (" + str(18446744073709551615/1000000) + ") was given: " + amountString + " at row " + str(rowNumber))
		sys.exit(2)
	if (amount <= 0):
		print("An amount that is zero or less, which is not allowed in a release schedule, was given: " + amountString + " at row " + str(rowNumber))
		sys.exit(2)
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
				amountInput = row[2].replace(thousandsSep, '').strip()
				amount = parse_and_validate_amount(amountInput, rowNumber)

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