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
from abc import abstractproperty
import sys
import json
import csv
import os
import re
from decimal import *
from datetime import datetime,date,time
from typing import List
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
expiry = datetime.now() + relativedelta(hours =+ 2) # proposal expires 2 hours from now

# If regular releases are before earliestReleaseTime, they get combined into one at that time.
# earliestReleaseTime = 14:00 CET tomorrow.
earliestReleaseTime = datetime.combine(date.today(), time.fromisoformat("14:00:00+01:00")) + relativedelta(days =+ 1)

assert initialReleaseTime < firstRemReleaseTime


class TransferAmount:

	max_amount:int = 18446744073709551615

	#basic constructor where amount is in microGTU
	def __init__(self, amount: int) -> None:
		if not self.__in_valid_range(amount):
			raise ValueError(f"Amount not in valid range (0,{self.max_amount}]")
		self.amount = amount

	#create a transfer amount from a transfer string
	@classmethod
	def from_string(cls,amount_string:str, decimal_sep:str, thousands_sep: str) -> 'TransferAmount':
		amount_regex = r"^[0-9]+([.][0-9]{1,6})?$"
		amount_regex_with_1000_sep = r"^[0-9]{1,3}([,][0-9]{3})*([.][0-9]{1,6})?$"
		translation_table = {ord(thousands_sep) : ',', ord(decimal_sep): '.'}
		amount_org_string = amount_string	
		if not bool(re.match(amount_regex, amount_string)) and not bool(re.match(amount_regex_with_1000_sep, amount_string)):
			raise ValueError(f"Amount {amount_org_string} is not a valid amount string.")
		amount_string = amount_string.replace(',', '')
		try: 
			amount = int(Decimal(amount_string) * 1000000)
		except: #this should not happen
			raise ValueError("Amount stringn {amount_org_string} could not be converted.")
		return TransferAmount(amount)

	def __str__(self):
		return f"{self.amount} microGTU"

	def __in_valid_range(self,x):
		return x > 0 and x <= self.max_amount

	#returns amount in GTU
	def get_GTU(self):
		return Decimal(self.amount)/Decimal(1000000)

	#returns amount in microGTU
	def get_micro_GTU(self):
		return self.amount

	#add two amounts
	def __add__(self,y:'TransferAmount') -> 'TransferAmount':
		return TransferAmount(self.amount + y.amount)

	def split_amount(self,n:int) -> List['TransferAmount']:
		if n <=0:
			raise AssertionError(f"Cannot split into {n} parts")
		elif n == 1:
			return [TransferAmount(self.amount)]
		else:
			step_amount = self.amount // n
			last_amount = self.amount - (n-1)*step_amount
			if step_amount <= 0:
				raise AssertionError(f"Cannot split {self.amount} into {n} parts, amount is too small")
			amount_list = [TransferAmount(step_amount) for _ in range(n-1)]
			amount_list.append(TransferAmount(last_amount))
			return amount_list

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
						"schedule": [] # filled below
					},
					"signatures": {}
				}

				if len(releases) == 1:
					# if there is only one release, amount is sum of initial and remaining amount
					schedule = [{
						"amount": initialAmount + remAmount,
						"timestamp": int(releases[0].timestamp()) * 1000 # multiply with 1000 to convert to milliseconds
					}]
				else:
					# if there are more releases, first compute amounts according to original schedule (i.e., assume no skipped releases)
					# in each remaining step give fraction of amount, rounded down
					# potentially give more in last release
					stepAmount = remAmount // (numReleases - 1)
					lastAmount = remAmount - (numReleases - 2) * stepAmount

					schedule = [{ # start with initial release plus all skipped releases and add remaining releases below
						"amount": initialAmount + (skippedReleases * stepAmount),
						"timestamp": int(releases[0].timestamp()) * 1000 # multiply with 1000 to convert to milliseconds
					}]

					for i in range(len(releases) - 2) :
						release = {"amount": stepAmount, "timestamp": int(releases[i+1].timestamp()) * 1000}
						schedule.append(release)
					
					lastRelease = {"amount": lastAmount, "timestamp": int(releases[len(releases)-1].timestamp()) * 1000}
					schedule.append(lastRelease)


				proposal["payload"]["schedule"] = schedule

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