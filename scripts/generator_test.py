
pg = __import__('proposal-generator')
wpg = __import__('welcome-proposal-generator')

from decimal import Decimal
import unittest
import random

class TestProposalGenerator(unittest.TestCase):
 
    def format_amount(self,amount_string: str):
        return amount_string.replace('.',pg.decimalSep).replace(',',pg.thousandsSep)

    def test_valid_number(self):
        self.assertEqual(
            pg.parse_and_validate_amount(self.format_amount('1278.123456'),1),
            1278123456
        )
        self.assertEqual(
            pg.parse_and_validate_amount(self.format_amount('1,278.123456'),1),
            1278123456
        )

    def test_random_valid_numbers(self):
        for i in range(0,1000):
            x = random.randrange(1,pg.maxAmount//1000000)
            y = random.randrange(1,1000000)
            z = x*1000000+y*10**(6-len(str(y)))
            self.assertEqual(pg.parse_and_validate_amount(self.format_amount(f"{x}.{y}"),1),z)
            self.assertEqual(pg.parse_and_validate_amount(self.format_amount(f"{x:,}.{y}"),1),z)

    def test_invalid_numbers(self):
        #Invalid format
        self.assertRaises(ValueError, pg.parse_and_validate_amount,self.format_amount('-12'),1)
        self.assertRaises(ValueError, pg.parse_and_validate_amount,self.format_amount('12,0'),1)
        self.assertRaises(ValueError, pg.parse_and_validate_amount,self.format_amount('120,0000.0'),1)
        self.assertRaises(ValueError, pg.parse_and_validate_amount,self.format_amount('0,,,,0,0.1,000,000000'),1)
        self.assertRaises(ValueError, pg.parse_and_validate_amount,self.format_amount('٠.001'),1)
        self.assertRaises(ValueError, pg.parse_and_validate_amount,self.format_amount('¼'),1)
        self.assertRaises(ValueError, pg.parse_and_validate_amount,self.format_amount('0.0000001'),1)
        #Too small
        self.assertRaises(ValueError, pg.parse_and_validate_amount,self.format_amount('0'),1)
        self.assertRaises(ValueError, pg.parse_and_validate_amount,self.format_amount('0.0'),1)
        #Too large
        self.assertRaises(ValueError, pg.parse_and_validate_amount,self.format_amount(str(pg.maxAmount//1000000+1)),1)



class TestWelcomeProposalGenerator(unittest.TestCase):

    def format_amount(self,amount_string: str):
        return amount_string.replace('.',wpg.decimalSep).replace(',',wpg.thousandsSep)

    def test_valid_number(self):
        self.assertEqual(
            wpg.parse_and_validate_amount(self.format_amount('1278.123456'),1),
            1278123456
        )
        self.assertEqual(
            wpg.parse_and_validate_amount(self.format_amount('1,278.123456'),1),
            1278123456
        )

    def test_random_valid_numbers(self):
        for i in range(0,1000):
            x = random.randrange(1,pg.maxAmount//1000000)
            y = random.randrange(1,1000000)
            z = x*1000000+y*10**(6-len(str(y)))
            self.assertEqual(wpg.parse_and_validate_amount(self.format_amount(f"{x}.{y}"),1),z)
            self.assertEqual(wpg.parse_and_validate_amount(self.format_amount(f"{x:,}.{y}"),1),z)

    def test_invalid_numbers(self):
        #Invalid format
        self.assertRaises(ValueError, wpg.parse_and_validate_amount,self.format_amount('-12'),1)
        self.assertRaises(ValueError, wpg.parse_and_validate_amount,self.format_amount('12,0'),1)
        self.assertRaises(ValueError, wpg.parse_and_validate_amount,self.format_amount('120,0000.0'),1)
        self.assertRaises(ValueError, wpg.parse_and_validate_amount,self.format_amount('0,,,,0,0.1,000,000000'),1)
        self.assertRaises(ValueError, wpg.parse_and_validate_amount,self.format_amount('٠.001'),1)
        self.assertRaises(ValueError, wpg.parse_and_validate_amount,self.format_amount('¼'),1)
        self.assertRaises(ValueError, wpg.parse_and_validate_amount,self.format_amount('0.0000001'),1)
        #Too small
        self.assertRaises(ValueError, wpg.parse_and_validate_amount,self.format_amount('0'),1)
        self.assertRaises(ValueError, wpg.parse_and_validate_amount,self.format_amount('0.0'),1)
        #Too large
        self.assertRaises(ValueError, wpg.parse_and_validate_amount,self.format_amount(str(wpg.maxAmount//1000000+1)),1)


if __name__ == '__main__':
    unittest.main()
    