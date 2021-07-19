from decimal import Decimal
import unittest
import random
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
            with self.subTest(i=z):
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
            [
                '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE',
                '4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7',
                TransferAmount(1000000), TransferAmount(1000000)
            ],
            [
                '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE',
                '4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7',
                TransferAmount(2000000000), TransferAmount(90000000000)
            ],
            [
                '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE',
                '4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7',
                TransferAmount(2000000000), TransferAmount(10000000000)
            ]
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
            [
                '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE',
                '4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7',
                TransferAmount(1000000000)
            ],
            [
                '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE',
                '4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7',
                TransferAmount(2000000000)
            ],
            [
                '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE',
                '4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7',
                TransferAmount(3000000000)
            ]
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

    def test_valid_welcome(self):
        time1 = datetime.combine(date.today(), time.fromisoformat("14:00:00+01:00"))
        time2 = time1 + relativedelta(hours =+ 1)
        not_relevant = time1
        #Welcome release after earliest release date
        with self.subTest(i=1):
            (release_times,skipped_releases) = build_release_schedule(True,time2,not_relevant,not_relevant,time1,10)
            self.assertEqual(skipped_releases,0)
            self.assertEqual(release_times,[time2])
        #Welcome release = earliest release date
        with self.subTest(i=2):
            (release_times,skipped_releases) = build_release_schedule(True,time1,not_relevant,not_relevant,time1,10)
            self.assertEqual(skipped_releases,0)
            self.assertEqual(release_times,[time1])
        #Welcome release before earliest release date
        with self.subTest(i=3):
            (release_times,skipped_releases) = build_release_schedule(True,time1,not_relevant,not_relevant,time2,10)
            self.assertEqual(skipped_releases,0)
            self.assertEqual(release_times,[time2])

    def test_valid_releases(self):
        num_releases = 10
        ir_time = datetime.combine(date.today(), time.fromisoformat("14:00:00+01:00"))
        frem_time = ir_time + relativedelta(days =+ 1)
        not_relevant = ir_time
        #No release should be skipped if the earliest release is before the initial release
        with self.subTest(i=1):
            er_time = ir_time + relativedelta(seconds =- 1)
            expected_rt = [ir_time] + [frem_time + relativedelta(months =+ i) for i in range(num_releases-1)]
            (release_times,skipped_releases) = build_release_schedule(False,not_relevant,ir_time,frem_time,er_time,num_releases)
            self.assertEqual(skipped_releases,0)
            self.assertEqual(release_times,expected_rt)
        #Test release schedule for earliest release right before the (i+1)th remaining release
        for i in range(0,num_releases-1):
            with self.subTest(i=i+2):
                er_time = frem_time + relativedelta(months =+ i,seconds =- 1)
                expected_rt = [er_time] + [frem_time + relativedelta(months =+ j) for j in range(i,num_releases-1)]
                (release_times,skipped_releases) = build_release_schedule(False,not_relevant,ir_time,frem_time,er_time,num_releases)
                self.assertEqual(skipped_releases,i)
        #Test release schedule for earliest release after all releases
        with self.subTest(i=num_releases+1):
                er_time = frem_time + relativedelta(months =+ num_releases-2,seconds =+ 1)
                expected_rt = [er_time]
                (release_times,skipped_releases) = build_release_schedule(False,not_relevant,ir_time,frem_time,er_time,num_releases)
                self.assertEqual(skipped_releases,num_releases-1)

    def test_invalid_release(self):
        #Initial release after first remaining release
        time1 = datetime.combine(date.today(), time.fromisoformat("14:00:00+01:00"))
        time2 = time1 + relativedelta(hours =+ 1)
        not_relevant = time1
        self.assertRaises(ValueError,build_release_schedule,False,not_relevant,time2,time1,not_relevant,10)

class TestJSONWriter(unittest.TestCase):

    def test_valid_welcome_transfer(self):
        welcome_transfer = [
            '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE',
            '4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7',
            TransferAmount(1000)
        ]
        time1 = datetime.combine(date.today(), time.fromisoformat("14:00:00+01:00"))
        release_times = [time1]
        transaction_expiry = datetime.now() + relativedelta(hours =+ 2) 
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
                  {'amount': 1000, 'timestamp': int(time1.timestamp())*1000}  
                ]
			},
			"signatures": {}
		}
        test_filename = './test.json'
        #Mock the file opening
        with patch('builtins.open', new=mock_open()) as mock_file: 
            #Mock json.dump as json.dump
            with patch('json.dump', new=mock_open()) as mock_call:
                transfer_to_json(True,welcome_transfer,release_times,1,0,transaction_expiry,test_filename)
                mock_call.assert_called_once_with(expected_content, mock_file(),indent=4)

    def test_valid_transfer(self):
        transfer = [
            '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE',
            '4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7',
            TransferAmount(1000),
            TransferAmount(10)
        ]
        time1 = datetime.combine(date.today(), time.fromisoformat("14:00:00+01:00"))
        release_times = [time1+ relativedelta(months =+ i) for i in range(7)]
        transaction_expiry = datetime.now() + relativedelta(hours =+ 2) 
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
				"schedule": [{'amount': 1003, 'timestamp': int(release_times[0].timestamp())*1000}] + 
                [{'amount': 1, 'timestamp': int(release_times[i].timestamp())*1000} for i in range(1,6)] +
                [{'amount': 2, 'timestamp': int(release_times[6].timestamp())*1000}]
			},
			"signatures": {}
		}
        test_filename = './test.json'
        #Mock the file opening
        with patch('builtins.open', new=mock_open()) as mock_file: 
            #Mock json.dump as json.dump
            with patch('json.dump', new=mock_open()) as mock_call:
                transfer_to_json(False,transfer,release_times,10,3,transaction_expiry,test_filename)
                mock_call.assert_called_once_with(expected_content, mock_file(),indent=4)

    def test_invalid_welcome_transfer(self):
        with self.subTest(i=1):
            transfer = [
                '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE',
                '4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7',
                TransferAmount(1000),
                TransferAmount(10)
            ]
            time1 = datetime.combine(date.today(), time.fromisoformat("14:00:00+01:00"))
            release_times = [time1]           
            self.assertRaises(ValueError,transfer_to_json,True,transfer,release_times,10,0,time1,'./test.json')
        with self.subTest(i=2):
            transfer = [
                '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE',
                '4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7',
                TransferAmount(1000)
            ]
            time1 = datetime.combine(date.today(), time.fromisoformat("14:00:00+01:00"))
            release_times = [time1, time1]           
            self.assertRaises(ValueError,transfer_to_json,True,transfer,release_times,10,0,time1,'./test.json')

    def test_invalid_transfer(self):
        with self.subTest(i=1):
            transfer = [
                '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE',
                '4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7',
                TransferAmount(1000)
            ]
            time1 = datetime.combine(date.today(), time.fromisoformat("14:00:00+01:00"))
            release_times = [time1,time1]           
            self.assertRaises(ValueError,transfer_to_json,True,transfer,release_times,10,0,time1,'./test.json')
        with self.subTest(i=2):
            transfer = [
                '38Dh9TwGWCieKppVu3ft91bjPvpyt7hWWNdFTRz9P3CCdvYHjE',
                '4QbKSwdnF1PTtN6LqdTfmUt7FQDTToxFVV746ysy7TazZy4zx7',
                TransferAmount(1000),
                TransferAmount(1000)
            ]
            time1 = datetime.combine(date.today(), time.fromisoformat("14:00:00+01:00"))
            release_times = [time1,time1,time1,time1]         
            self.assertRaises(ValueError,transfer_to_json,True,transfer,release_times,10,3,time1,'./test.json')

if __name__ == '__main__':
    unittest.main()
    