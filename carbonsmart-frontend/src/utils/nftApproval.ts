import { toast } from 'react-hot-toast'

const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'operator', type: 'address' },
      { internalType: 'bool', name: 'approved', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'operator', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
]

/**
 * Approve the marketplace backend to transfer a specific NFT
 */
export async function approveNFT(
  walletClient: any,
  contractAddress: string,
  marketplaceOperator: string,
  tokenId: number,
  userAddress: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    if (!walletClient) {
      return { success: false, error: 'Wallet not connected' }
    }

    // Send the approve transaction directly
    const txHash = await walletClient.writeContract({
      address: contractAddress as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'approve',
      args: [marketplaceOperator as `0x${string}`, BigInt(tokenId)],
      account: userAddress as `0x${string}`,
      gas: 100000n, // Set reasonable gas limit for approve transaction
    })

    return {
      success: true,
      txHash,
    }
  } catch (error: any) {
    console.error('Approval error:', error)
    return {
      success: false,
      error: error.message || 'Failed to approve NFT',
    }
  }
}

/**
 * Approve the marketplace backend to transfer ALL NFTs (setApprovalForAll)
 */
export async function approveAllNFTs(
  walletClient: any,
  contractAddress: string,
  marketplaceOperator: string,
  userAddress: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    if (!walletClient) {
      return { success: false, error: 'Wallet not connected' }
    }

    // Send the setApprovalForAll transaction directly
    const txHash = await walletClient.writeContract({
      address: contractAddress as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'setApprovalForAll',
      args: [marketplaceOperator as `0x${string}`, true],
      account: userAddress as `0x${string}`,
      gas: 100000n, // Set reasonable gas limit for setApprovalForAll transaction
    })

    return {
      success: true,
      txHash,
    }
  } catch (error: any) {
    console.error('Approval error:', error)
    return {
      success: false,
      error: error.message || 'Failed to approve all NFTs',
    }
  }
}
