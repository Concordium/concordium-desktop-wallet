# This script allows to generate proposals from a csv file exported from Excel.
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
import argparse
from decimal import *
from datetime import datetime,date,time
from typing import List
from dateutil.relativedelta import relativedelta
from base58 import b58decode_check

numReleases = 10
initialReleaseTime = datetime.fromisoformat("2021-07-26T14:00:00+01:00")
firstRemReleaseTime = datetime.fromisoformat("2021-08-26T14:00:00+01:00")
csvDelimiter = ','
thousands_sep = ','
decimal_sep = '.'
assert len(csvDelimiter) == 1 and len(thousands_sep) == 1 and len(decimal_sep) == 1 and thousands_sep != decimal_sep
transaction_expiry = datetime.now() + relativedelta(hours =+ 2) # proposals expire 2 hours from now

# If regular releases are before earliestReleaseTime, they get combined into one at that time.
# earliestReleaseTime = 14:00 CET tomorrow.
earliestReleaseTime = datetime.combine(date.today(), time.fromisoformat("14:00:00+01:00")) + relativedelta(days =+ 1)

assert initialReleaseTime < firstRemReleaseTime

# Class for storing transfer amounts. 
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
	def get_GTU(self) -> Decimal:
		return Decimal(self.amount)/Decimal(1000000)

	#returns amount in microGTU
	def get_micro_GTU(self) -> int:
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
	def add_release(self, amount: TransferAmount, release_time: datetime):
		release = {
			"amount": amount.get_micro_GTU(),
			"timestamp": int(release_time.timestamp()) * 1000 # multiply by 1000 since timestamps here are in milliseconds
		} 
		self.data["payload"]["schedule"].append(release)

	# Write pre-proposal to json file with given filename.
	def write_json(self, filename: str):
		with open(filename, 'w') as outFile:
			json.dump(self.data, outFile, indent=4)


# Main function
def main():
	parser = argparse.ArgumentParser(description="Generate pre-proposals from the csv file \"input_csv\".\n"\
		"For each row in the csv file, a json file with the corresponding pre-proposal is generated in the same folder.\n"
		"\n"
		"The expected format of that file is a UTF-8 csv file with:\n"\
		"One row for each transfer, columns separated by ','.\n"\
		"The first column contains the sender address, the second one the receiver address.\n"\
		"The third column contains the amount of the first release in GTU.\n"\
		"The fourth column contains the total amount of remaining releases in GTU (if not generating welcome transfers).\n"\
		"GTU amounts must be formatted as decimals with 6 digits after the decimal dot and possibly using ',' as thousands separator.\n"\
		"\n"\
		"If the optional argument \"--welcome\" is present, the tool generates pre-proposals for welcome transfers.\n"\
		"These only have one release, and thus expect a csv file with only 3 columns: sender, receiver, and amount.\n"
		"\n"
		"The release schedules are hard-coded in this script.", formatter_class=argparse.RawDescriptionHelpFormatter)
	parser.add_argument("input_csv", type=str, help="Filename of a csv file to generate pre-proposals from.")
	parser.add_argument("--welcome", help="Generate welcome transfers with only one release.", action="store_true")
	args = parser.parse_args()
	
	is_welcome = args.welcome
	csvFileName = args.input_csv

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
					initialAmount = TransferAmount.from_string(row[2], decimal_sep, thousands_sep)
					remAmount = TransferAmount.from_string(row[3], decimal_sep, thousands_sep)
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
					
					#Split amount into list
					amount_list = remAmount.split_amount(numReleases-1)

					#Add up skipped releases
					first_release = initialAmount
					for i in range(skippedReleases):
						first_release  = first_release + amount_list[i]
					pp.add_release(first_release, releases[0])

					#Add remaining releases
					for i in range(skippedReleases, len(amount_list)) :
						pp.add_release(amount_list[i], releases[i-skippedReleases])
					

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