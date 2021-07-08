
proposal_generator = __import__('proposal-generator')
welcome_proposal_generator = __import__('welcome-proposal-generator')

from decimal import Decimal
import unittest
import random

class TestProposalGenerator(unittest.TestCase):

    def test_valid_number(self):
        self.assertEqual(
            proposal_generator.parse_and_validate_amount('78.123456',1),
            78123456
        )

    def test_random_valid_numbers(self):
        for i in range(0,1000):
            x = random.randrange(1,proposal_generator.maxAmount)
            self.assertEqual(
                proposal_generator.parse_and_validate_amount(str(Decimal(x) / Decimal(1000000)),1),
                x
            )

    def test_invalid_numbers(self):
        self.assertRaises(ValueError, proposal_generator.parse_and_validate_amount,'-12',1)
        self.assertRaises(ValueError, proposal_generator.parse_and_validate_amount,'12.',1)
        self.assertRaises(ValueError, proposal_generator.parse_and_validate_amount,'12,0',1)
        self.assertRaises(ValueError, proposal_generator.parse_and_validate_amount,'٠.001',1)
        self.assertRaises(ValueError, proposal_generator.parse_and_validate_amount,'¼',1)
        self.assertRaises(ValueError, proposal_generator.parse_and_validate_amount,'0',1)
        self.assertRaises(ValueError, proposal_generator.parse_and_validate_amount,'0.0',1)
        self.assertRaises(ValueError, proposal_generator.parse_and_validate_amount,'0.0000001',1)
        self.assertRaises(ValueError, proposal_generator.parse_and_validate_amount,str(proposal_generator.maxAmount),1)


class TestWelcomeProposalGenerator(unittest.TestCase):

    def test_valid_number(self):
        self.assertEqual(
            welcome_proposal_generator.parse_and_validate_amount('78.123456',1),
            78123456
        )

    def test_random_valid_numbers(self):
        for i in range(0,1000):
            x = random.randrange(1,proposal_generator.maxAmount)
            self.assertEqual(
                welcome_proposal_generator.parse_and_validate_amount(str(Decimal(x) / Decimal(1000000)),1),
                x
            )

    def test_invalid_numbers(self):
        self.assertRaises(ValueError, welcome_proposal_generator.parse_and_validate_amount,'-12',1)
        self.assertRaises(ValueError, welcome_proposal_generator.parse_and_validate_amount,'12.',1)
        self.assertRaises(ValueError, welcome_proposal_generator.parse_and_validate_amount,'12,0',1)
        self.assertRaises(ValueError, welcome_proposal_generator.parse_and_validate_amount,'٠.001',1)
        self.assertRaises(ValueError, welcome_proposal_generator.parse_and_validate_amount,'¼',1)
        self.assertRaises(ValueError, welcome_proposal_generator.parse_and_validate_amount,'0',1)
        self.assertRaises(ValueError, welcome_proposal_generator.parse_and_validate_amount,'0.0',1)
        self.assertRaises(ValueError, welcome_proposal_generator.parse_and_validate_amount,'0.0000001',1)
        self.assertRaises(ValueError, welcome_proposal_generator.parse_and_validate_amount,str(welcome_proposal_generator.maxAmount),1)


if __name__ == '__main__':
    unittest.main()
