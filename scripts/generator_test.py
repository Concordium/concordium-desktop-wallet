from decimal import Decimal
import unittest
import random
from proposal_generator import *

class TestTransferAmount(unittest.TestCase):

    def test_from_string_valid(self):
        self.assertEqual(TransferAmount.from_string('1278.123456','.',','),TransferAmount(1278123456))
        self.assertEqual(TransferAmount.from_string('1,278.123456','.',','),TransferAmount(1278123456))

    def test_from_string_random_valid(self):
        for i in range(0,1000):
            x = random.randrange(1,TransferAmount.max_amount//1000000)
            y = random.randrange(1,1000000)
            z = x*1000000+y*10**(6-len(str(y)))
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
        for i in range(0,1000):
            c = random.randrange(1,TransferAmount.max_amount)
            b = random.randrange(1,c)
            a = c-b
            self.assertEqual(TransferAmount(a)+TransferAmount(b),TransferAmount(c))

if __name__ == '__main__':
    unittest.main()
    