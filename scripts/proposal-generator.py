# This script allows to generate proposals from a csv file exported from Excel.
# Run the script with one command line argument determining the path to that file.
# The expected format of that file is a UTF-8 csv file with:
# one row for each transfer, columns separated by ';'
# The first column contains sender address, the second one the receiver address
# The third column contains amount of first release in GTU
# (as decimal with 6 digits after decimal dot and possibly using '’' as thousands separator)
# The fourth column contains total amount of remaining releases in GTU (formatted as second column)
# The release schedules are hard-coded in this script.
#
# Note: The script uses dateutil, which can be installed using "pip install python-dateutil"

import sys
import json
import csv
from decimal import *
from datetime import datetime
from dateutil.relativedelta import relativedelta

numReleases = 10
initialReleaseTime = datetime.fromisoformat("2021-07-26T14:00:00+01:00")
firstRemReleaseTime = datetime.fromisoformat("2021-08-26T14:00:00+01:00")
csvDelimiter = ';'
thousandsSep = '’'
expiry = datetime.now() + relativedelta(hours =+ 2) # proposal expires 2 hours from now

# read csv file
with open(sys.argv[1], newline='', encoding='utf-8-sig') as csvfile:
	reader = csv.reader(csvfile, delimiter=csvDelimiter)

	rowNumber = 0

	for row in reader:
		rowNumber += 1

		senderAddress = row[0]
		receiverAddress = row[1]
		initialAmount = Decimal(row[2].replace(thousandsSep, '')) # remove thousands separator used in Excel
		initialAmount = int(initialAmount * 1000000) # convert from GTU to microGTU
		remAmount = Decimal(row[3].replace(thousandsSep, ''))
		remAmount = int(remAmount * 1000000)

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

		schedule = [{ # start with initial release and add remaining releases below
			"amount": initialAmount,
			"timestamp": int(initialReleaseTime.timestamp()) * 1000 # multiply with 1000 to convert to milliseconds
		}] 

		# in each remaining step give fraction of amount, rounded down
		# potentially give more in last release
		stepAmount = remAmount // (numReleases - 1)
		lastAmount = remAmount - (numReleases - 2) * stepAmount

		rTime = firstRemReleaseTime

		for i in range(numReleases - 2) :
			release = {"amount": stepAmount, "timestamp": int(rTime.timestamp()) * 1000}
			schedule.append(release)
			rTime += relativedelta(months =+ 1) # next release is 1 month later
		
		lastRelease = {"amount": lastAmount, "timestamp": int(rTime.timestamp()) * 1000}
		schedule.append(lastRelease)

		proposal["payload"]["schedule"] = schedule

		with open("pre-proposal_" + str(rowNumber).zfill(3) + ".json", 'w') as outfile:
			json.dump(proposal, outfile, indent=4)
