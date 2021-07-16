# This script allows to generate proposals from a csv file exported from Excel.
# Run the script with one command line argument determining the path to that file.
# The expected format of that file is a UTF-8 csv file with:
# one row for each transfer, columns separated by ','
# The first column contains sender address, the second one the receiver address
# The third column contains amount of first release in GTU
# (as decimal with 6 digits after decimal dot and possibly using ',' as thousands separator)
# The fourth column contains total amount of remaining releases in GTU (formatted as second column)
# The release schedules are hard-coded in this script.
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

numReleases = 10
initialReleaseTime = datetime.fromisoformat("2021-07-26T14:00:00+01:00")
firstRemReleaseTime = datetime.fromisoformat("2021-08-26T14:00:00+01:00")
csvDelimiter = ','
thousandsSep = ','
decimalSep = '.'
assert len(csvDelimiter) == 1 and len(thousandsSep) == 1 and len(decimalSep) == 1 and thousandsSep != decimalSep
maxAmount = 18446744073709551615
transaction_expiry = datetime.now() + relativedelta(hours =+ 2) # proposals expire 2 hours from now

# If regular releases are before earliestReleaseTime, they get combined into one at that time.
# earliestReleaseTime = 14:00 CET tomorrow.
earliestReleaseTime = datetime.combine(date.today(), time.fromisoformat("14:00:00+01:00")) + relativedelta(days =+ 1)

assert initialReleaseTime < firstRemReleaseTime

# Class for generating scheduled pre-proposals and saving them as json files.
# A pre-proposal is a proposal with empty nonce, energy and fee amounts.
# The desktop wallet can convert them to proper proposals.
class ScheduledPreProposal:
	# Initialize pre-proposal with sender, receiver, and expiry time, with empty schedule
	def __init__(self, senderAddress: str, receiverAddress: str, expiry: datetime):
		self.data = {
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
				"schedule": [] # initially empty, filled by add_release
			},
			"signatures": {}
		}

	# Add a release to the schedule.
	def add_release(self, amount: int, release_time: datetime):
		release = {
			"amount": amount,
			"timestamp": int(release_time.timestamp()) * 1000 # multiply by 1000 since timestamps here are in milliseconds
		} 
		self.data["payload"]["schedule"].append(release)

	# Write pre-proposal to json file with given filename.
	def write_json(self, filename: str):
		with open(filename, 'w') as outFile:
			json.dump(self.data, outFile, indent=4)

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
	translation_table = {ord(thousandsSep) : ',', ord(decimalSep): '.'}
	amount_org_string = amount_string
	#Strip white space and replace separators
	amount_string  = amount_string.translate(translation_table).strip()
	#Ensure valid format
	if not bool(re.match(amount_regex, amount_string)) and not bool(re.match(amount_regex_with_1000_sep, amount_string)):
		print(f"Amount {amount_org_string} at row {row_number} is not a valid amount string.")
		print(f"Valid amounts are positive, use '{decimalSep}' as decimal separator, use '{thousandsSep}' as an optional thousand separator, and have at most 6 decimal digits.")
		print(f"E.g., 1{thousandsSep}000{thousandsSep}000{decimalSep}12 and 1000000{decimalSep}12 are valid amounts")
		raise ValueError("Invalid amount format.")
	#Remove thousand separator
	amount_string = amount_string.replace(',', '')
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

	# Build release schedule.
	# Normal schedule consists of numReleases, with first one at initialReleaseTime,
	# and the remaining ones one month after each other, starting with firstRemReleaseTime.
	#
	# If the transfer is delayed, some realeases can be in the past. In that case,
	# combine all releases before earliestReleaseTime into one release at that time.
	releases = []
		
	if initialReleaseTime >= earliestReleaseTime:
		releases.append(initialReleaseTime)
	else:
		releases.append(earliestReleaseTime)

	for i in range(numReleases - 1):
		# remaining realeses are i month after first remaining release
		plannedReleaseTime = firstRemReleaseTime + relativedelta(months =+ i)

		# Only add release if not before earliestReleaseTime.
		# Note that earliestReleaseTime will already be in list since initialReleaseTime < firstRemReleaseTime.
		if plannedReleaseTime >= earliestReleaseTime:
			releases.append(plannedReleaseTime)
	
	skippedReleases = numReleases - len(releases) # number of releases to be combined into the initial release

	# read csv file
	rowNumber = 0
	try:
		with open(csvFileName, newline='', encoding='utf-8-sig') as csvfile:
			reader = csv.reader(csvfile, delimiter=csvDelimiter)

			for row in reader:
				rowNumber += 1

				if len(row) != 4:
					print("Error: Incorrect file format. Each row must contains exactly 4 entires. Row ", rowNumber, " contains ", len(row), ".", sep='')
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
					initialAmount = parse_and_validate_amount(row[2], rowNumber)
					remAmount = parse_and_validate_amount(row[3], rowNumber)
				except ValueError as error:
					print(f"Error: {error}")
					sys.exit(2)

				pp = ScheduledPreProposal(senderAddress, receiverAddress, transaction_expiry)
				
				if len(releases) == 1:
					# if there is only one release, amount is sum of initial and remaining amount
					pp.add_release(initialAmount + remAmount, releases[0])
				else:
					# if there are more releases, first compute amounts according to original schedule (i.e., assume no skipped releases)
					# in each remaining step give fraction of amount, rounded down
					# potentially give more in last release
					stepAmount = remAmount // (numReleases - 1)
					lastAmount = remAmount - (numReleases - 2) * stepAmount

					pp.add_release(initialAmount + (skippedReleases * stepAmount), releases[0])

					for i in range(len(releases) - 2) :
						pp.add_release(stepAmount, releases[i+1])
					
					# add last release
					pp.add_release(lastAmount, releases[len(releases)-1])


				outFileName = "pre-proposal_" + baseCsvName + "_" + str(rowNumber).zfill(3) + ".json";
				try:
					pp.write_json(outFileName)
				except IOError:
					print("Error writing file \"", outFileName, "\".", sep='')
					sys.exit(3)

	except IOError:
		print("Error reading file \"", csvFileName, "\".", sep='')
		sys.exit(3)

	print("Successfully generated", rowNumber, "proposals.")

if __name__ == "__main__":
	main()