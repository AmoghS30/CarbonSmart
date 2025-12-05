# backend/api/blockchain_utils.py
def mint_credit(user_address, emission_amount):
    """
    Mock blockchain minting — replace with Web3 integration later.
    """
    print(f"Simulating mint for {user_address} with emission {emission_amount}")
    if emission_amount > 0:
        return "0x123abcFAKEHASH"
    else:
        return "Minting failed"
