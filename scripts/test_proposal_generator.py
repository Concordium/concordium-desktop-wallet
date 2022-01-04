# Tests for proposal_generator.py
# Version 0.2.0

from decimal import Decimal
import unittest
import random
from unittest.case import skip
from dateutil.relativedelta import relativedelta
from unittest.mock import patch, mock_open
from proposal_generator import *


class TestTransferAmount(unittest.TestCase):

    def test_basics(self):
        x = random.randrange(1,TransferAmount.max_amount)
        a = TransferAmount(x)
        b = TransferAmount(TransferAmount.max_amount)
        self.assertEqual(a.get_micro_GTU(),x)
        self.assertEqual(a.get_GTU(),Decimal(x)/Decimal(1000000))
        self.assertEqual(a,TransferAmount(x))
        self.assertEqual(b.get_micro_GTU(),TransferAmount.max_amount)
        self.assertRaises(ValueError,TransferAmount, 0)
        self.assertRaises(ValueError,TransferAmount, -1)
        self.assertRaises(ValueError,TransferAmount,TransferAmount.max_amount+1)

    def test_from_string_valid(self):
        self.assertEqual(TransferAmount.from_string('1278.123456','.',','),TransferAmount(1278123456))
        self.assertEqual(TransferAmount.from_string('1,278.123456','.',','),TransferAmount(1278123456))

    def test_from_string_random_valid(self):
        for i in range(0,1000):
            x = random.randrange(1,(TransferAmount.max_amount+1)//1000000)
            y = random.randrange(1,1000000)
            z = x*1000000+y*10**(6-len(str(y)))
            with self.subTest(z):
                self.assertEqual(TransferAmount.from_string(f"{x}.{y}",'.',','),TransferAmount(z))
                self.assertEqual(TransferAmount.from_string(f"{x:,}.{y}",'.',','),TransferAmount(z))

    def test_from_string_invalid(self):
        #Invalid format
        self.assertRaises(ValueError, TransferAmount.from_string,'-12','.',',')
        self.assertRaises(ValueError, TransferAmount.from_string,'12,0','.',',')
        self.assertRaises(ValueError, TransferAmount.from_string,'120,0000.0','.',',')
        self.assertRaises(ValueError, TransferAmount.from_string,'0,,,,0,0.1,000,000000','.',',')
        self.assertRaises(ValueError, TransferAmount.from_string,'٠.001','.',',')
        self.assertRaises(ValueError, TransferAmount.from_string,'¼','.',',')
        self.assertRaises(ValueError, TransferAmount.from_string,'0.0000001','.',',')
        #Too small
        self.assertRaises(ValueError, TransferAmount.from_string,'0','.',',')
        self.assertRaises(ValueError, TransferAmount.from_string,'0.0','.',',')
        #Too large
        self.assertRaises(ValueError, TransferAmount.from_string,str(TransferAmount.max_amount//1000000+1),'.',',')

    def test_addition(self):
        #Random additions in valid range
        for i in range(0,1000):
            c = random.randrange(1,TransferAmount.max_amount)
            b = random.randrange(1,c)
            a = c-b
            self.assertEqual(TransferAmount(a)+TransferAmount(b),TransferAmount(c))
        #out of range addition
        self.assertRaises(ValueError, lambda: TransferAmount(TransferAmount.max_amount)+TransferAmount(1))

    def test_split(self):
        #invalid splits
        x = TransferAmount(10)
        self.assertRaises(AssertionError,x.split_amount,-1)
        self.assertRaises(AssertionError,x.split_amount,0)
        self.assertRaises(AssertionError,x.split_amount,11)
        #valid split
        y = x.split_amount(9)
        for i in range(len(y)-1):
            self.assertEqual(y[i],TransferAmount(1))
        self.assertEqual(y[-1],TransferAmount(2))

class TestCSVReader(unittest.TestCase):

    def test_valid_release(self):
        release_test_data = (
            '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE,4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7," 1 "," 1 "\n'
            '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE,4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7," 2,000.000000 "," 90,000.000000 "\n'
            '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE,4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7," 2,000.000000 "," 10,000.000000 "\n'
        )
        expected_result = [
            {
                "sender_address": '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE',
                "receiver_address":'4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7',
                "initial_amount" : TransferAmount(1000000), 
                "remaining_amount" : TransferAmount(1000000)
            },
            {
                "sender_address": '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE',
                "receiver_address":'4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7',
                "initial_amount" : TransferAmount(2000000000), 
                "remaining_amount" : TransferAmount(90000000000)
            },
            {
                "sender_address": '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE',
                "receiver_address":'4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7',
                "initial_amount" : TransferAmount(2000000000), 
                "remaining_amount" : TransferAmount(10000000000)
            }
        ]
        test_filename = './test.csv'
        with patch('builtins.open', new=mock_open(read_data=release_test_data)) as mock_file:
            result = csv_to_list(test_filename,False,'.',',',',')
            mock_file.assert_called_once_with(test_filename, newline='', encoding='utf-8-sig')
            self.assertEqual(result,expected_result)
    
    def test_valid_welcome_release(self):
        release_test_data = (
            '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE,4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7," 1,000.000000 "\n'
            '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE,4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7," 2,000.000000 "\n'
            '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE,4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7," 3,000.000000 "\n'
        )
        expected_result = [
            {
                "sender_address": '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE',
                "receiver_address":'4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7',
                "amount" : TransferAmount(1000000000)
            },
            {
                "sender_address": '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE',
                "receiver_address":'4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7',
                "amount" : TransferAmount(2000000000)
            },
            {
                "sender_address": '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE',
                "receiver_address":'4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7',
                "amount" : TransferAmount(3000000000)
            }
        ]
        test_filename = './test.csv'
        with patch('builtins.open', new=mock_open(read_data=release_test_data)) as mock_file:
            result = csv_to_list(test_filename,True,'.',',',',')
            mock_file.assert_called_once_with(test_filename, newline='', encoding='utf-8-sig')
            self.assertEqual(result,expected_result)

    def test_invalid_size(self):
        release_test_data = ( #third row is bad
            '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE,4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7," 1,000.000000 "," 2,000.000000 "\n'
            '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE,4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7," 2,000.000000 "," 2,000.000000 "\n'
            '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE,4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7," 3,000.000000 "\n'
        )
        test_filename = './test.csv'
        with patch('builtins.open', new=mock_open(read_data=release_test_data)) as mock_file:
            self.assertRaises(ValueError,csv_to_list,test_filename,False,'.',',',',')
            mock_file.assert_called_once_with(test_filename, newline='', encoding='utf-8-sig')    

    def test_invalid_welcome_size(self):
        release_test_data = ( #second row is bad
            '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE,4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7," 1,000.000000 "\n'
            '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE,4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7," 2,000.000000 "," 2,000.000000 "\n'
            '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE,4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7," 3,000.000000 "\n'
        )
        test_filename = './test.csv'
        with patch('builtins.open', new=mock_open(read_data=release_test_data)) as mock_file:
            self.assertRaises(ValueError,csv_to_list,test_filename,True,'.',',',',')
            mock_file.assert_called_once_with(test_filename, newline='', encoding='utf-8-sig')  
                
    def test_invalid_sender(self):
        release_test_data = ( #third row is bad
            '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE,4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7," 1,000.000000 "," 2,000.000000 "\n'
            '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE,4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7," 2,000.000000 "," 2,000.000000 "\n'
            '39Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE,4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7," 3,000.000000 "," 2,000.000000 "\n'
        )
        test_filename = './test.csv'
        with patch('builtins.open', new=mock_open(read_data=release_test_data)) as mock_file:
            self.assertRaises(ValueError,csv_to_list,test_filename,False,'.',',',',')
            mock_file.assert_called_once_with(test_filename, newline='', encoding='utf-8-sig') 

    def test_invalid_receiver(self):
        release_test_data = ( #second row is bad
            '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE,4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7," 1,000.000000 "," 2,000.000000 "\n'
            '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE,4abKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7," 2,000.000000 "," 2,000.000000 "\n'
            '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE,4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7," 3,000.000000 "," 2,000.000000 "\n'
        )
        test_filename = './test.csv'
        with patch('builtins.open', new=mock_open(read_data=release_test_data)) as mock_file:
            self.assertRaises(ValueError,csv_to_list,test_filename,False,'.',',',',')
            mock_file.assert_called_once_with(test_filename, newline='', encoding='utf-8-sig')

class TestReleaseScheduleBuilder(unittest.TestCase):

    def test_valid_releases(self):
        num_releases = 10
        ir_time = datetime.combine(date.today(), time.fromisoformat("14:00:00+01:00"))
        frem_time = ir_time + relativedelta(days =+ 1)
        #No release should be skipped if the earliest release is before the initial release
        with self.subTest(1):
            er_time = ir_time + relativedelta(seconds = -1)
            expected_rt = [ir_time] + [frem_time + relativedelta(months =+ i) for i in range(num_releases-1)]
            (release_times,skipped_releases) = build_release_schedule(ir_time,frem_time,er_time,num_releases)
            self.assertEqual(skipped_releases,0)
            self.assertEqual(release_times,expected_rt)
            self.assertEqual(len(release_times),num_releases-skipped_releases)
        #Test release schedule for earliest release right before the (i+1)th remaining release
        for i in range(0,num_releases-1):
            with self.subTest(i+2):
                er_time = frem_time + relativedelta(months = +i, seconds = -1)
                expected_rt = [er_time] + [frem_time + relativedelta(months = +j) for j in range(i,num_releases-1)]
                (release_times,skipped_releases) = build_release_schedule(ir_time,frem_time,er_time,num_releases)
                self.assertEqual(skipped_releases,i)
                self.assertEqual(len(release_times),num_releases-skipped_releases)
        #Test release schedule for earliest release after all releases
        with self.subTest(num_releases+1):
                er_time = frem_time + relativedelta(months = +num_releases-2, seconds = +1)
                expected_rt = [er_time]
                (release_times,skipped_releases) = build_release_schedule(ir_time,frem_time,er_time,num_releases)
                self.assertEqual(skipped_releases,num_releases-1)
                self.assertEqual(len(release_times),num_releases-skipped_releases)

    def test_invalid_release(self):
        num_releases = 10
        #Initial release after first remaining release
        time1 = datetime.combine(date.today(), time.fromisoformat("14:00:00+01:00"))
        time2 = time1 + relativedelta(hours = +1)
        not_relevant = time1
        self.assertRaises(ValueError,build_release_schedule,time2,time1,not_relevant,num_releases)

class TestAmountToScheduledList(unittest.TestCase):

    def test_valid_amounts(self):
        initial_amount = TransferAmount(1000)
        remaining_amount = TransferAmount(10)
        num_releases = 10
        skipped = 3
        expected_result = [TransferAmount(1003)] + [TransferAmount(1)]*5 + [TransferAmount(2)]
        result = amounts_to_scheduled_list(initial_amount,remaining_amount,num_releases,skipped)    
        self.assertEqual(result,expected_result)

    def test_random_valid_amounts(self):
        for i in range(0,1000):
            with self.subTest(i):
                n = random.randrange(1,25) #num_releases := n+1
                skipped = random.randrange(0,n+1) #skipped releases
                #Amount for the initial release
                init = random.randrange(1,10000)
                #Amount for each remaining release
                q = random.randrange(1,10000)
                #Remainder paid out with the last release
                r = random.randrange(0,n) 
                initial_amount = TransferAmount(init)
                remaining_amount = TransferAmount(q*n+r)
                expected_result = [TransferAmount(init+q*skipped)] + [TransferAmount(q)] * (n-skipped)
                if r > 0:
                    expected_result[-1] += TransferAmount(r)
                result = amounts_to_scheduled_list(initial_amount,remaining_amount,n+1,skipped)
                self.assertEqual(result,expected_result)

    def test_invalid_amounts(self):
        self.assertRaises(ValueError,amounts_to_scheduled_list,TransferAmount(1),TransferAmount(1),10,10)



class TestMain(unittest.TestCase):

    def test_valid_welcome_transfer(self):
        time1 = datetime.combine(date.today(), time.fromisoformat("14:00:00+01:00")) + relativedelta(days = +10)
        transfers = [
            {
                "sender_address": '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE',
                "receiver_address":'4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7',
                "amount" : TransferAmount(1000000000)
            }
        ]
        arguments = argparse.Namespace(welcome=True, input_csv='./test.csv')
        config = {
		"num_releases" : 10,
		"welcome_release_time" : time1,
		"initial_release_time" : datetime.fromisoformat("1970-08-26T14:00:00+01:00"),
		"first_rem_release_time" : datetime.fromisoformat("1970-08-26T14:00:00+01:00"), 
		"csv_delimiter" : ',',
		"thousands_sep" : ',',
		"decimal_sep" : '.'
	    }
        transaction_expiry = datetime.now() + relativedelta(hours = +2) #Must be the same as in main
        expected_content = {
			"sender": '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE',
			"nonce": "", 
			"energyAmount": "", 
			"estimatedFee": "", 
			"expiry": {
				"@type": "bigint",
				"value": int(transaction_expiry.timestamp())
			},
			"transactionKind": 19,
			"payload": {
				"toAddress": '4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7',
				"schedule": [
                  {'amount': 1000000000, 'timestamp': int(time1.timestamp())*1000}  
                ]
			},
			"signatures": {}
		}
        #Mock various calls
        with patch('proposal_generator.get_config', return_value=config) as get_fake_config:
            with patch('argparse.ArgumentParser.parse_args', return_value=arguments) as fake_args:
                with patch('proposal_generator.csv_to_list',return_value=transfers) as fake_csv:
                    with patch('builtins.open', new=mock_open()) as mock_file: 
                        with patch('json.dump', new=mock_open()) as mock_call:
                            main()
                            mock_call.assert_called_once_with(expected_content, mock_file(),indent=4)
                           
    def test_valid_transfer(self):
        time1 = datetime.combine(date.today(), time.fromisoformat("14:00:00+01:00")) + relativedelta(months =- 3)
        time2 = time1 + relativedelta(months = +1)
        transfers = [
            {
                "sender_address": '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE',
                "receiver_address":'4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7',
                "initial_amount" : TransferAmount(1000),
                "remaining_amount" : TransferAmount(10)
            }
        ]
        arguments = argparse.Namespace(welcome=False, input_csv='./test.csv')
        config = {
		"num_releases" : 10,
		"welcome_release_time" : datetime.fromisoformat("1970-08-26T14:00:00+01:00"),
		"initial_release_time" : time1,
		"first_rem_release_time" : time2, 
		"csv_delimiter" : ',',
		"thousands_sep" : ',',
		"decimal_sep" : '.'
	    }
        #These two dates must be the same as in main
        transaction_expiry = datetime.now() + relativedelta(hours = +2)
        earliest_release_time = datetime.combine(date.today(), time.fromisoformat("14:00:00+01:00")) + relativedelta(days = +1)
        expected_content = {
			"sender": '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE',
			"nonce": "", 
			"energyAmount": "", 
			"estimatedFee": "", 
			"expiry": {
				"@type": "bigint",
				"value": int(transaction_expiry.timestamp())
			},
			"transactionKind": 19,
			"payload": {
				"toAddress": '4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7',
				"schedule": [{'amount': 1003, 'timestamp': int(earliest_release_time.timestamp())*1000}] + 
                [{'amount': 1, 'timestamp': int((time1 + relativedelta(months = +i)).timestamp())*1000} for i in range(4,9)] +
                [{'amount': 2, 'timestamp': int((time1 + relativedelta(months = +9)).timestamp())*1000}]
			},
			"signatures": {}
		}
        #Mock various calls
        with patch('proposal_generator.get_config', return_value=config) as get_fake_config:
            with patch('argparse.ArgumentParser.parse_args', return_value=arguments) as fake_args:
                with patch('proposal_generator.csv_to_list',return_value=transfers) as fake_csv:
                    with patch('builtins.open', new=mock_open()) as mock_file: 
                        with patch('json.dump', new=mock_open()) as mock_call:
                            main()
                            mock_call.assert_called_once_with(expected_content, mock_file(),indent=4)

if __name__ == '__main__':
    unittest.main()
    