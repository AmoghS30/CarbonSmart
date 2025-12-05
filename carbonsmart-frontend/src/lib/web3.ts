import { ethers } from 'ethers';

// CarbonCredit contract deployed on Sepolia testnet
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x100bd2512011b0e93A01266a646ba8eB4dee5312';

const CONTRACT_ABI = [
  "function getUserCredits(address user) external view returns (uint256[])",
  "function getCredit(uint256 tokenId) external view returns (tuple(uint256 co2Amount, uint256 timestamp, string activityType))",
  "function balanceOf(address owner) external view returns (uint256)",
  "event CreditMinted(address indexed user, uint256 indexed tokenId, uint256 co2Amount, string activityType)"
];

export class Web3Service {
  private provider: ethers.providers.Web3Provider | null = null;
  private contract: ethers.Contract | null = null;
  private signer: ethers.Signer | null = null;

  async connect() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed!');
    }

    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Request account access
    await this.provider.send("eth_requestAccounts", []);
    
    this.signer = this.provider.getSigner();
    const address = await this.signer.getAddress();
    
    // Check if on Sepolia
    const network = await this.provider.getNetwork();
    if (network.chainId !== 11155111) { // Sepolia chain ID
      throw new Error('Please switch to Sepolia Test Network in MetaMask');
    }

    this.contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      this.signer
    );

    return address;
  }

  async getUserCredits(userAddress: string) {
    if (!this.contract) throw new Error('Not connected');

    const tokenIds = await this.contract.getUserCredits(userAddress);
    
    const credits = await Promise.all(
      tokenIds.map(async (tokenId: ethers.BigNumber) => {
        const credit = await this.contract!.getCredit(tokenId);
        return {
          tokenId: tokenId.toString(),
          co2Amount: parseFloat(ethers.utils.formatUnits(credit.co2Amount, 0)) / 1000, // Convert grams to kg
          timestamp: new Date(credit.timestamp.toNumber() * 1000),
          activityType: credit.activityType
        };
      })
    );

    return credits;
  }

  async getCreditBalance(userAddress: string) {
    if (!this.contract) throw new Error('Not connected');
    const balance = await this.contract.balanceOf(userAddress);
    return balance.toNumber();
  }

  disconnect() {
    this.provider = null;
    this.contract = null;
    this.signer = null;
  }
}

export const web3Service = new Web3Service();