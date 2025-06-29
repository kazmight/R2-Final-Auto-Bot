require('dotenv').config();
const { ethers } = require('ethers');
const inquirer = require('inquirer').default;
const chalk = require('chalk').default;

// --- Blockchain Configuration ---
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;
const ETHERSCAN_BASE_URL = 'https://sepolia.etherscan.io/'; // Explicit Sepolia Etherscan URL

if (!PRIVATE_KEY || !RPC_URL) {
    console.error(chalk.red('❌ Error: PRIVATE_KEY atau RPC_URL tidak ditemukan di file .env. Pastikan file .env sudah benar.'));
    process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const signer = wallet.connect(provider);

// --- Contract Addresses ---
// Base Token Addresses
const R2_TOKEN_ADDRESS = '0xb816bB88f836EA75Ca4071B46FF285f690C43bb7';
const USDC_TOKEN_ADDRESS = '0x8BEbFCBe5468F146533C182dF3DFbF5ff9BE00E2';
const R2USD_TOKEN_ADDRESS = '0x9e8FF356D35a2Da385C546d6Bf1D77ff85133365'; // R2USD token
const SR2USD_TOKEN_ADDRESS = '0x006CbF409CA275bA022111dB32BDAE054a97d488'; // sR2USD token

// LP Token Addresses (identified from transactions and pool behavior)
const R2_USDC_LP_CONTRACT_ADDRESS = '0xCdfDD7dD24bABDD05A2ff4dfcf06384c5Ad661a9'; // LP for R2-USDC pair
const R2_R2USD_LP_CONTRACT_ADDRESS = '0x9Ae18109312c1452D3f0952d7eC1e26D15211FE9a1'; // LP for R2-R2USD pair
const USDC_R2USD_LP_CONTRACT_ADDRESS = '0x47d1B0623bB3E557bF8544C159c9ae51D091F8a2'; // LP for USDC-R2USD pair (also the Curve pool address)
const R2USD_SR2USD_LP_CONTRACT_ADDRESS = '0xe85A06C238439F981c90b2C91393b2F3c46e27FC'; // LP for R2USD-sR2USD pair (also the Curve pool address)

// Router/Pool Addresses (where transactions are sent)
const SWAP_ROUTER_ADDRESS_R2_USDC = '0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3'; // Uniswap V2-like router (used for R2-USDC and R2-R2USD)
const CURVE_POOL_ADDRESS_USDC_R2USD = '0x47d1B0623bB3E557bF8544C159c9ae51D091F8a2'; // Curve-like pool for USDC-R2USD
const CURVE_POOL_ADDRESS_R2USD_SR2USD = '0xe85A06C238439F981c90b2C91393b2C91393b2F3c46e27FC'; // Curve-like pool for R2USD-sR2USD

// ABI for standard ERC20 tokens (to check balance and approve)
const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function name() view returns (string)",
    // <<<--- PERBAIKAN: Tambahkan fungsi allowance ke ABI --->>>
    "function allowance(address owner, address spender) view returns (uint256)"
];

// ABI for Uniswap V2-like Router (used for R2-USDC and R2-R2USD pairs)
const UNISWAP_V2_ROUTER_ABI = [{"inputs":[{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_WETH","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"amountADesired","type":"uint256"},{"internalType":"uint256","name":"amountBDesired","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountTokenDesired","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountIn","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountOut","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsIn","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"reserveA","type":"uint256"},{"internalType":"uint256","name":"reserveB","type":"uint256"}],"name":"quote","outputs":[{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETHSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermit","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermitSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityWithPermit","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapETHForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETHSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

// ABI for Curve-like pools (USDC-R2USD and R2USD-sR2USD)
const CURVE_POOL_ABI = [{"name":"Transfer","inputs":[{"name":"sender","type":"address","indexed":true},{"name":"receiver","type":"address","indexed":true},{"name":"value","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"Approval","inputs":[{"name":"owner","type":"address","indexed":true},{"name":"spender","type":"address","indexed":true},{"name":"value","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"TokenExchange","inputs":[{"name":"buyer","type":"address","indexed":true},{"name":"sold_id","type":"int128","indexed":false},{"name":"tokens_sold","type":"uint256","indexed":false},{"name":"bought_id","type":"int128","indexed":false},{"name":"tokens_bought","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"TokenExchangeUnderlying","inputs":[{"name":"buyer","type":"address","indexed":true},{"name":"sold_id","type":"int128","indexed":false},{"name":"tokens_sold","type":"uint256","indexed":false},{"name":"bought_id","type":"int128","indexed":false},{"name":"tokens_bought","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"AddLiquidity","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_amounts","type":"uint256[]","indexed":false},{"name":"fees","type":"uint256[]","indexed":false},{"name":"invariant","type":"uint256","indexed":false},{"name":"token_supply","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"RemoveLiquidity","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_amounts","type":"uint256[]","indexed":false},{"name":"fees","type":"uint256[]","indexed":false},{"name":"token_supply","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"RemoveLiquidityOne","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_id","type":"int128","indexed":false},{"name":"token_amount","type":"uint256","indexed":false},{"name":"coin_amount","type":"uint256","indexed":false},{"name":"token_supply","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"RemoveLiquidityImbalance","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_amounts","type":"uint256[]","indexed":false},{"name":"fees","type":"uint256[]","indexed":false},{"name":"invariant","type":"uint256","indexed":false},{"name":"token_supply","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"RampA","inputs":[{"name":"old_A","type":"uint256","indexed":false},{"name":"new_A","type":"uint256","indexed":false},{"name":"initial_time","type":"uint256","indexed":false},{"name":"future_time","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"StopRampA","inputs":[{"name":"A","type":"uint256","indexed":false},{"name":"t","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"ApplyNewFee","inputs":[{"name":"fee","type":"uint256","indexed":false},{"name":"offpeg_fee_multiplier","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"SetNewMATime","inputs":[{"name":"ma_exp_time","type":"uint256","indexed":false},{"name":"D_ma_time","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"stateMutability":"nonpayable","type":"constructor","inputs":[{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_A","type":"uint256"},{"name":"_fee","type":"uint256"},{"name":"_offpeg_fee_multiplier","type":"uint256"},{"name":"_ma_exp_time","type":"uint256"},{"name":"_coins","type":"address[]"},{"name":"_rate_multipliers","type":"uint256[]"},{"name":"_asset_types","type":"uint8[]"},{"name":"_method_ids","type":"bytes4[]"},{"name":"_oracles","type":"address[]"}],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"exchange","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"_dx","type":"uint256"},{"name":"_min_dy","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"exchange","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"_dx","type":"uint256"},{"name":"_min_dy","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"exchange_received","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"_dx","type":"uint256"},{"name":"_min_dy","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"exchange_received","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"_dx","type":"uint256"},{"name":"_min_dy","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"add_liquidity","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_min_mint_amount","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"add_liquidity","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_min_mint_amount","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity_one_coin","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"i","type":"int128"},{"name":"_min_received","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity_one_coin","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"i","type":"int128"},{"name":"_min_received","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity_imbalance","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_max_burn_amount","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity_imbalance","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_max_burn_amount","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"_min_amounts","type":"uint256[]"}],"outputs":[{"name":"","type":"uint256[]"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"_min_amounts","type":"uint256[]"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256[]"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"_min_amounts","type":"uint256[]"},{"name":"_receiver","type":"address"},{"name":"_claim_admin_fees","type":"bool"}],"outputs":[{"name":"","type":"uint256[]"}]},{"stateMutability":"nonpayable","type":"function","name":"withdraw_admin_fees","inputs":[],"outputs":[]},{"stateMutability":"view","type":"function","name":"last_price","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"ema_price","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"get_p","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"price_oracle","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"D_oracle","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"transfer","inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"nonpayable","type":"function","name":"transferFrom","inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"nonpayable","type":"function","name":"approve","inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"nonpayable","type":"function","name":"permit","inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"},{"name":"_deadline","type":"uint256"},{"name":"_v","type":"uint8"},{"name":"_r","type":"bytes32"},{"name":"_s","type":"bytes32"}],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"view","type":"function","name":"DOMAIN_SEPARATOR","inputs":[],"outputs":[{"name":"","type":"bytes32"}]},{"stateMutability":"view","type":"function","name":"get_dx","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"dy","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"get_dy","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"dx","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"calc_withdraw_one_coin","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"i","type":"int128"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"totalSupply","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"get_virtual_price","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"calc_token_amount","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_is_deposit","type":"bool"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"A","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"A_precise","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"balances","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"get_balances","inputs":[],"outputs":[{"name":"","type":"uint256[]"}]},{"stateMutability":"view","type":"function","name":"stored_rates","inputs":[],"outputs":[{"name":"","type":"uint256[]"}]},{"stateMutability":"view","type":"function","name":"dynamic_fee","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"ramp_A","inputs":[{"name":"_future_A","type":"uint256"},{"name":"_future_time","type":"uint256"}],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"stop_ramp_A","inputs":[],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"set_new_fee","inputs":[{"name":"_new_fee","type":"uint256"},{"name":"_new_offpeg_fee_multiplier","type":"uint256"}],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"set_ma_exp_time","inputs":[{"name":"_ma_exp_time","type":"uint256"},{"name":"_D_ma_time","type":"uint256"}],"outputs":[]},{"stateMutability":"view","type":"function","name":"N_COINS","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"coins","inputs":[{"name":"arg0","type":"uint256"}],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"fee","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"offpeg_fee_multiplier","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"admin_fee","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"initial_A","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"future_A","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"initial_A_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"future_A_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"admin_balances","inputs":[{"name":"arg0","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"ma_exp_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"D_ma_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"ma_last_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"name","inputs":[],"outputs":[{"name":"","type":"string"}]},{"stateMutability":"view","type":"function","name":"symbol","inputs":[],"outputs":[{"name":"","type":"string"}]},{"stateMutability":"view","type":"function","name":"decimals","inputs":[],"outputs":[{"name":"","type":"uint8"}]},{"stateMutability":"view","type":"function","name":"version","inputs":[],"outputs":[{"name":"","type":"string"}]},{"stateMutability":"view","type":"function","name":"balanceOf","inputs":[{"name":"arg0","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"allowance","inputs":[{"name":"arg0","type":"address"},{"name":"arg1","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"nonces","inputs":[{"name":"arg0","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"salt","inputs":[],"outputs":[{"name":"","type":"bytes32"}]}]

// ABI for R2-R2USD LP token (likely not needed directly if router handles removal)
// Kept for reference, but usage in performRemoveLiquidity might need adjustment depending on actual contract interaction.
const ADD_LIQUIDITY_ABI_R2_R2USD_LP = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount0Out","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1Out","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Swap","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint112","name":"reserve0","type":"uint112"},{"indexed":false,"internalType":"uint112","name":"reserve1","type":"uint112"}],"name":"Sync","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MINIMUM_LIQUIDITY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"burn","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getReserves","outputs":[{"internalType":"uint112","name":"_reserve0","type":"uint112"},{"internalType":"uint112","name":"_reserve1","type":"uint112"},{"internalType":"uint32","name":"_blockTimestampLast","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_token0","type":"address"},{"internalType":"address","name":"_token1","type":"address"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"mint","outputs":[{"internalType":"uint256","name":"liquidity","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"price0CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"price1CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"skim","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount0Out","type":"uint256"},{"internalType":"uint256","name":"amount1Out","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"swap","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"sync","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}]}]


// --- Helper Functions ---

async function getERC20TokenInfo(tokenAddress) {
    try {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const symbol = await tokenContract.symbol();
        const decimals = await tokenContract.decimals();
        const balance = await tokenContract.balanceOf(wallet.address);
        return { symbol, decimals, balance };
    } catch (error) {
        // Hanya log error jika BUKAN UNCONFIGURED_NAME
        if (error.code !== 'UNCONFIGURED_NAME') {
            console.warn(chalk.yellow(`⚠️ Could not fetch info for token ${tokenAddress.substring(0, 8)}...`));
            console.warn(chalk.yellow(`   Error Details: ${error.message}`));
            if (error.code) console.warn(chalk.yellow(`   Ethers.js Code: ${error.code}`));
            if (error.reason) console.warn(chalk.yellow(`   Reason: ${error.reason}`));
            if (error.data) console.warn(chalk.yellow(`   Data: ${error.data}`));
        }

        // Untuk LP token atau token yang tidak dikenal, berikan simbol fallback dan desimal default
        if (tokenAddress === R2_USDC_LP_CONTRACT_ADDRESS) return { symbol: `R2-USDC LP`, decimals: 18, balance: ethers.toBigInt(0) };
        if (tokenAddress === R2_R2USD_LP_CONTRACT_ADDRESS) return { symbol: `R2-R2USD LP`, decimals: 18, balance: ethers.toBigInt(0) };
        if (tokenAddress === USDC_R2USD_LP_CONTRACT_ADDRESS) return { symbol: `USDC-R2USD LP`, decimals: 18, balance: ethers.toBigInt(0) };
        if (tokenAddress === R2USD_SR2USD_LP_CONTRACT_ADDRESS) return { symbol: `R2USD-sR2USD LP`, decimals: 18, balance: ethers.toBigInt(0) };
        
        // Fallback umum untuk alamat token lain yang tidak dikenal
        return { symbol: `Unknown (${tokenAddress.substring(0, 6)}...)`, decimals: 18, balance: ethers.toBigInt(0) };
    }
}

async function displayBalances() {
    console.log(chalk.cyan(`\n✨ Saldo Token Anda`));
    const tokensToDisplay = [
        { name: 'R2', address: R2_TOKEN_ADDRESS, isLP: false },
        { name: 'USDC', address: USDC_TOKEN_ADDRESS, isLP: false },
        { name: 'R2USD', address: R2USD_TOKEN_ADDRESS, isLP: false },
        { name: 'sR2USD', address: SR2USD_TOKEN_ADDRESS, isLP: false }, // sR2USD is also the staking contract
        { name: 'R2-USDC LP', address: R2_USDC_LP_CONTRACT_ADDRESS, isLP: true },
        // Perubahan di sini: Tetap tampilkan R2-R2USD LP dengan nama kustom
        { name: 'R2-R2USD LP', address: R2_R2USD_LP_CONTRACT_ADDRESS, isLP: true, customZeroText: "Tidak ada di dompet (kemungkinan di stake/farm)" },
        { name: 'USDC-R2USD LP', address: USDC_R2USD_LP_CONTRACT_ADDRESS, isLP: true },
        { name: 'sR2USD-R2USD LP', address: R2USD_SR2USD_LP_CONTRACT_ADDRESS, isLP: true },
    ];

    for (const tokenConfig of tokensToDisplay) {
        const info = await getERC20TokenInfo(tokenConfig.address);

        const symbolToDisplay = tokenConfig.name; // Selalu gunakan nama kustom yang kita definisikan

        let formattedBalance;

        // Cek jika ada customZeroText dan saldo memang nol
        if (tokenConfig.isLP && info.balance === ethers.toBigInt(0) && tokenConfig.customZeroText) {
            formattedBalance = tokenConfig.customZeroText;
        } else {
            // Untuk LP token R2-R2USD atau LP token lain yang saldonya tidak nol, paksakan presisi tinggi (20 desimal)
            // Atau untuk semua LP token, agar konsisten
            if (tokenConfig.isLP) { // Terapkan untuk semua LP token
                // Check if decimals are available and not zero to prevent division by zero
                formattedBalance = info.decimals > 0 ? parseFloat(ethers.formatUnits(info.balance, info.decimals)).toFixed(20) : info.balance.toString();
            } else {
                // Untuk token dasar, gunakan formatting default ethers.js
                formattedBalance = ethers.formatUnits(info.balance, info.decimals);
            }
        }

        // Tampilkan jika:
        // 1. Bukan token LP (selalu tampilkan token dasar)
        // 2. Adalah token LP DAN saldonya > 0
        // 3. Ada customZeroText (ini akan menangani kasus R2-R2USD LP yang nol)
        if (!tokenConfig.isLP || (tokenConfig.isLP && info.balance > ethers.toBigInt(0)) || (tokenConfig.isLP && tokenConfig.customZeroText)) {
            console.log(chalk.yellow(`  ${symbolToDisplay}: ${formattedBalance}`));
        }
    }
    console.log(chalk.cyan('----------------------------------'));
}

async function approveToken(tokenAddress, spenderAddress, amount) {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    try {
        console.log(chalk.blue(`\n🚀 Meminta persetujuan untuk ${await tokenContract.symbol()}...`));
        // Check current allowance first to avoid unnecessary transactions
        const currentAllowance = await tokenContract.allowance(wallet.address, spenderAddress);
        if (currentAllowance >= amount) {
            console.log(chalk.green(`✅ Persetujuan sudah cukup (${ethers.formatUnits(currentAllowance, await tokenContract.decimals())}). Tidak perlu persetujuan baru.`));
            return true;
        }

        const tx = await tokenContract.approve(spenderAddress, amount);
        console.log(chalk.blue(`⏳ Mengirim transaksi persetujuan: ${chalk.underline.blue(`${ETHERSCAN_BASE_URL}tx/${tx.hash}`)}`));
        await tx.wait();
        console.log(chalk.green(`✅ Persetujuan ${await tokenContract.symbol()} berhasil! Transaksi: ${chalk.underline.blue(`${ETHERSCAN_BASE_URL}tx/${tx.hash}`)}`));
        return true;
    } catch (error) {
        console.error(chalk.red(`❌ Gagal menyetujui token ${await tokenContract.symbol()}: ${error.message}`));
        if (error.reason) console.error(chalk.red(`   Reason: ${error.reason}`));
        if (error.code) console.error(chalk.red(`   Ethers.js Code: ${error.code}`));
        if (error.data) console.error(chalk.red(`   Data: ${error.data}`));
        return false;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Fungsi Swap ---

async function performSwap(tokenInAddress, tokenOutAddress, amountPercentage, routerAddress, abi) {
    console.log(chalk.magenta(`\n💫 Memulai SWAP...`));
    const tokenInInfo = await getERC20TokenInfo(tokenInAddress);
    const tokenOutInfo = await getERC20TokenInfo(tokenOutAddress);

    if (tokenInInfo.balance === ethers.toBigInt(0)) {
        console.log(chalk.yellow(`⚠️ Anda tidak memiliki ${tokenInInfo.symbol} untuk di-swap.`));
        return false;
    }

    const amountToSwap = (tokenInInfo.balance * ethers.toBigInt(amountPercentage)) / ethers.toBigInt(100);
    
    // Ensure amountToSwap is not zero after percentage calculation
    if (amountToSwap === ethers.toBigInt(0)) {
        console.log(chalk.yellow(`⚠️ Jumlah ${tokenInInfo.symbol} yang dihitung untuk di-swap adalah nol setelah persentase. Pastikan saldo Anda cukup atau tingkatkan persentase.`));
        return false;
    }

    const formattedAmountToSwap = ethers.formatUnits(amountToSwap, tokenInInfo.decimals);

    console.log(chalk.yellow(`🔄 Akan melakukan swap ${formattedAmountToSwap} ${tokenInInfo.symbol} menjadi ${tokenOutInfo.symbol}`));

    // Approve router untuk membelanjakan token
    const approvalSuccess = await approveToken(tokenInAddress, routerAddress, amountToSwap);
    if (!approvalSuccess) {
        return false;
    }

    const routerContract = new ethers.Contract(routerAddress, abi, signer);

    // --- Tambahkan opsi transaksi dengan gasLimit yang lebih tinggi untuk swap juga ---
    const txOptions = {
        gasLimit: 350000 // Gas limit umum untuk swap Uniswap V2-like
    };

    try {
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 menit dari sekarang
        const path = [tokenInAddress, tokenOutAddress]; // Path untuk swap

        // --- Implementasi Toleransi Slippage ---
        let amountsOut;
        try {
            amountsOut = await routerContract.getAmountsOut(amountToSwap, path);
            console.log(chalk.blue(`💰 Estimasi output swap: ${ethers.formatUnits(amountsOut[1], tokenOutInfo.decimals)} ${tokenOutInfo.symbol}`));
        } catch (getAmountsOutError) {
            console.error(chalk.red(`❌ Gagal mendapatkan estimasi output swap: ${getAmountsOutError.message}`));
            if (getAmountsOutError.reason) console.error(chalk.red(`   Reason: ${getAmountsOutError.reason}`));
            if (getAmountsOutError.code) console.error(chalk.red(`   Ethers.js Code: ${getAmountsOutError.code}`));
            return false;
        }

        const SLIPPAGE_TOLERANCE_PERCENT = 0.5;
        const amountOutMin = (amountsOut[1] * ethers.toBigInt(Math.floor(10000 - SLIPPAGE_TOLERANCE_PERCENT * 100))) / ethers.toBigInt(10000);

        console.log(chalk.cyan(`📉 Toleransi Slippage: ${SLIPPAGE_TOLERANCE_PERCENT}%`));
        console.log(chalk.cyan(`Output Minimum yang Diterima: ${ethers.formatUnits(amountOutMin, tokenOutInfo.decimals)} ${tokenOutInfo.symbol}`));
        // --- Akhir Implementasi Toleransi Slippage ---

        console.log(chalk.blue(`Sending swapExactTokensForTokens transaction...`));
        const tx = await routerContract.swapExactTokensForTokens(
            amountToSwap,
            amountOutMin,
            path,
            wallet.address,
            deadline,
            txOptions // --- Tambahkan opsi di sini ---
        );

        console.log(chalk.blue(`⏳ Mengirim transaksi swap: ${chalk.underline.blue(`${ETHERSCAN_BASE_URL}tx/${tx.hash}`)}`));
        await tx.wait();
        console.log(chalk.green(`✅ SWAP berhasil! Transaksi: ${chalk.underline.blue(`${ETHERSCAN_BASE_URL}tx/${tx.hash}`)}`));
        return true;
    } catch (error) {
        console.error(chalk.red(`❌ SWAP gagal: ${error.message}`));
        if (error.reason) console.error(chalk.red(`   Reason: ${error.reason}`));
        if (error.code) console.error(chalk.red(`   Ethers.js Code: ${error.code}`));
        if (error.data) console.error(chalk.red(`   Data: ${error.data}`));
        // Attempt to parse specific error messages for better user feedback
        if (error.message.includes("INSUFFICIENT_LIQUIDITY_MINTED")) {
            console.error(chalk.red("   Penyebab Umum: Insufficient liquidity (pool mungkin kering) atau slippage terlalu ketat. Coba tingkatkan toleransi slippage atau kurangi jumlah swap."));
        } else if (error.message.includes("INSUFFICIENT_INPUT_AMOUNT")) {
            console.error(chalk.red("   Penyebab Umum: Jumlah input terlalu kecil untuk mendapatkan output yang berarti atau membayar biaya."));
        } else if (error.message.includes("TRANSFER_FROM_FAILED")) {
             console.error(chalk.red("   Penyebab Umum: Transfer token dari dompet Anda ke router gagal. Mungkin masalah persetujuan atau saldo tidak cukup."));
        } else if (error.message.includes("transaction failed")) {
            console.error(chalk.red("   Penyebab Umum: Transaksi direvert oleh kontrak. Periksa detail di Etherscan."));
        }
        return false;
    }
}

// --- Fungsi Add Liquidity ---

async function performAddLiquidity(tokenAAddress, tokenBAddress, amountPercentage, routerAddress, abi, lpTokenAddress) {
    console.log(chalk.magenta(`\n💧 Memulai ADD LIQUIDITY...`));

    const lpTokenInfo = await getERC20TokenInfo(lpTokenAddress);

    const tokenAInfo = await getERC20TokenInfo(tokenAAddress);
    const tokenBInfo = await getERC20TokenInfo(tokenBAddress);

    if (tokenAInfo.balance === ethers.toBigInt(0) || tokenBInfo.balance === ethers.toBigInt(0)) {
        console.log(chalk.yellow(`⚠️ Anda tidak memiliki cukup ${tokenAInfo.symbol} atau ${tokenBInfo.symbol} untuk menambah likuiditas.`));
        return false;
    }

    const amountADesired = (tokenAInfo.balance * ethers.toBigInt(amountPercentage)) / ethers.toBigInt(100);
    const amountBDesired = (tokenBInfo.balance * ethers.toBigInt(amountPercentage)) / ethers.toBigInt(100);

    // Ensure desired amounts are not zero
    if (amountADesired === ethers.toBigInt(0) || amountBDesired === ethers.toBigInt(0)) {
        console.log(chalk.yellow(`⚠️ Jumlah token yang dihitung untuk menambah likuiditas adalah nol setelah persentase. Pastikan saldo Anda cukup atau tingkatkan persentase.`));
        return false;
    }

    console.log(chalk.yellow(`💦 Akan menambahkan ${ethers.formatUnits(amountADesired, tokenAInfo.decimals)} ${tokenAInfo.symbol} dan ${ethers.formatUnits(amountBDesired, tokenBInfo.decimals)} ${tokenBInfo.symbol} ke likuiditas.`));

    // Approve router untuk membelanjakan kedua token
    let approvalSuccessA = await approveToken(tokenAAddress, routerAddress, amountADesired);
    if (!approvalSuccessA) return false;

    let approvalSuccessB = await approveToken(tokenBAddress, routerAddress, amountBDesired);
    if (!approvalSuccessB) return false;

    const routerContract = new ethers.Contract(routerAddress, abi, signer);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 menit dari sekarang

    // --- Tambahkan opsi transaksi dengan gasLimit yang lebih tinggi ---
    const txOptions = {
        gasLimit: 750000 // Gas limit yang lebih tinggi untuk add liquidity di Curve-like pools
    };

    try {
        let tx;
        if (routerAddress === SWAP_ROUTER_ADDRESS_R2_USDC) { // Applies to R2-USDC and R2-R2USD
            tx = await routerContract.addLiquidity(
                tokenAAddress,
                tokenBAddress,
                amountADesired,
                amountBDesired,
                0, // amountAMin, diatur ke 0 untuk kesederhanaan, idealnya hitung toleransi slippage
                0, // amountBMin, diatur ke 0 untuk kesederhanaan, idealnya hitung toleransi slippage
                wallet.address,
                deadline,
                txOptions // --- Tambahkan opsi di sini ---
            );
        } else if (routerAddress === CURVE_POOL_ADDRESS_USDC_R2USD || routerAddress === CURVE_POOL_ADDRESS_R2USD_SR2USD) {
            console.log(chalk.blue(`Mengirim transaksi add_liquidity ke pool mirip Curve...`));

            let amounts;
            if (routerAddress === CURVE_POOL_ADDRESS_USDC_R2USD) {
                // Pool USDC-R2USD expects [R2USD, USDC] based on Etherscan (coins(0) = R2USD, coins(1) = USDC)
                amounts = [amountBDesired, amountADesired]; 
            } else { // This is for CURVE_POOL_ADDRESS_R2USD_SR2USD
                // Pool R2USD-sR2USD expects [sR2USD, R2USD] based on Etherscan (coins(0) = sR2USD, coins(1) = R2USD)
                amounts = [amountBDesired, amountADesired]; 
            }

            let estimatedLPTokens;
            try {
                estimatedLPTokens = await routerContract.calc_token_amount(amounts, true);
                console.log(chalk.blue(`💰 Estimasi LP token yang akan diterima: ${ethers.formatUnits(estimatedLPTokens, lpTokenInfo.decimals)} ${lpTokenInfo.symbol}`));
            } catch (calcError) {
                console.error(chalk.red(`❌ Gagal mendapatkan estimasi LP token dari pool: ${calcError.message}`));
                if (calcError.reason) console.error(chalk.red(`   Reason: ${calcError.reason}`));
                if (calcError.code) console.error(chalk.red(`   Ethers.js Code: ${calcError.code}`));
                console.log(chalk.red("Pastikan urutan token dalam 'amounts' sesuai dengan 'coins' di ABI pool."));
                estimatedLPTokens = ethers.toBigInt(0); // Fallback to 0 if estimation fails
            }

            const LP_MINT_SLIPPAGE_TOLERANCE_PERCENT = 5.0; // Meningkatkan toleransi untuk pool Curve
            let minMintAmount;

            if (estimatedLPTokens > 0) {
                minMintAmount = (estimatedLPTokens * ethers.toBigInt(Math.floor(10000 - LP_MINT_SLIPPAGE_TOLERANCE_PERCENT * 100))) / ethers.toBigInt(10000);
            } else {
                minMintAmount = ethers.toBigInt(0);
                console.log(chalk.yellow("⚠️ Estimasi LP token gagal, melanjutkan dengan minMintAmount = 0 (tanpa perlindungan slippage)."));
            }

            console.log(chalk.cyan(`📉 Toleransi Slippage LP Mint: ${LP_MINT_SLIPPAGE_TOLERANCE_PERCENT}%`));
            console.log(chalk.cyan(`Minimum LP token yang akan dicetak: ${ethers.formatUnits(minMintAmount, lpTokenInfo.decimals)} ${lpTokenInfo.symbol}`));

            // Calling add_liquidity with _receiver
            tx = await routerContract['add_liquidity(uint256[],uint256,address)'](
                amounts,
                minMintAmount,
                wallet.address,
                txOptions // --- Tambahkan opsi di sini ---
            );
        } else {
            console.error(chalk.red(`❌ Router Add Liquidity tidak dikenal: ${routerAddress}`));
            return false;
        }

        console.log(chalk.blue(`⏳ Mengirim transaksi add liquidity: ${chalk.underline.blue(`${ETHERSCAN_BASE_URL}tx/${tx.hash}`)}`));
        await tx.wait();
        console.log(chalk.green(`✅ ADD LIQUIDITY berhasil! Transaksi: ${chalk.underline.blue(`${ETHERSCAN_BASE_URL}tx/${tx.hash}`)}`));
        return true;
    } catch (error) {
        console.error(chalk.red(`❌ ADD LIQUIDITY gagal: ${error.message}`));
        if (error.reason) console.error(chalk.red(`   Reason: ${error.reason}`));
        if (error.code) console.error(chalk.red(`   Ethers.js Code: ${error.code}`));
        if (error.data) console.error(chalk.red(`   Data: ${error.data}`));
        // Add more specific error parsing for Add Liquidity
        if (error.message.includes("INSUFFICIENT_A_AMOUNT") || error.message.includes("INSUFFICIENT_B_AMOUNT")) {
            console.error(chalk.red("   Penyebab Umum: Saldo token tidak cukup atau jumlah yang diinginkan terlalu kecil."));
        } else if (error.message.includes("K_")) { // Often related to Uniswap V2 K-invariant checks
            console.error(chalk.red("   Penyebab Umum: K-invariant check failed (harga/rasio likuiditas terlalu jauh dari harapan). Coba tingkatkan slippage."));
        } else if (error.message.includes("MIN_MINT_AMOUNT")) {
            console.error(chalk.red("   Penyebab Umum: Jumlah LP token yang dicetak kurang dari minimum yang diharapkan (slippage terlalu ketat)."));
        } else if (error.message.includes("transaction failed")) {
            console.error(chalk.red("   Penyebab Umum: Transaksi direvert oleh kontrak. Periksa detail di Etherscan."));
        }
        return false;
    }
}

// --- Fungsi Remove Liquidity ---

async function performRemoveLiquidity(pairName, liquidityPoolAddress, amountPercentage, routerAddress, abi) {
    console.log(chalk.magenta(`\n🗑️ Memulai REMOVE LIQUIDITY untuk ${pairName}...`));

    const lpTokenInfo = await getERC20TokenInfo(liquidityPoolAddress);

    if (lpTokenInfo.balance === ethers.toBigInt(0)) {
        console.log(chalk.yellow(`⚠️ Anda tidak memiliki LP token (${lpTokenInfo.symbol}) untuk dihapus likuiditasnya untuk ${pairName}.`));
        return false;
    }

    const amountToBurn = (lpTokenInfo.balance * ethers.toBigInt(amountPercentage)) / ethers.toBigInt(100);
    
    // Ensure amountToBurn is not zero after percentage calculation
    if (amountToBurn === ethers.toBigInt(0)) {
        console.log(chalk.yellow(`⚠️ Jumlah LP token yang dihitung untuk dihapus likuiditasnya adalah nol setelah persentase. Pastikan saldo LP Anda cukup atau tingkatkan persentase.`));
        return false;
    }

    const formattedAmountToBurn = ethers.formatUnits(amountToBurn, lpTokenInfo.decimals);

    console.log(chalk.yellow(`🔥 Akan menghapus likuiditas sebanyak ${formattedAmountToBurn} LP token (${lpTokenInfo.symbol}).`));

    // Approve router untuk membelanjakan token LP
    const approvalSuccess = await approveToken(liquidityPoolAddress, routerAddress, amountToBurn);
    if (!approvalSuccess) {
        return false;
    }

    const routerContract = new ethers.Contract(routerAddress, abi, signer);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 menit dari sekarang

    const txOptions = {
        gasLimit: 750000 // Gas limit yang lebih tinggi
    };

    try {
        let tx;
        let minAmounts; // Declare minAmounts here

        if (routerAddress === SWAP_ROUTER_ADDRESS_R2_USDC) {
            // For Uniswap V2-like router (removeLiquidity function)
            // Need to get reserves to calculate min amounts
            
            // For R2-USDC, assuming token0 is R2 and token1 is USDC
            let token0Addr = R2_TOKEN_ADDRESS;
            let token1Addr = USDC_TOKEN_ADDRESS;

            // To properly calculate min amounts for Uniswap V2 removeLiquidity,
            // you'd typically query the reserves from the specific LP pair contract.
            // Since we're using the router's removeLiquidity, and its ABI doesn't directly
            // expose a way to get expected output given LP tokens, setting a very low min
            // amount as a placeholder. This is a potential point of high slippage risk.
            // A more robust implementation would fetch pair contract and its getReserves().
            minAmounts = [ethers.toBigInt(0), ethers.toBigInt(0)]; // Placeholder for actual min amounts calculation

            if (pairName === 'R2-USDC') {
                tx = await routerContract.removeLiquidity(
                    R2_TOKEN_ADDRESS,
                    USDC_TOKEN_ADDRESS,
                    amountToBurn,
                    minAmounts[0], // amountAMin (R2)
                    minAmounts[1], // amountBMin (USDC)
                    wallet.address,
                    deadline,
                    txOptions
                );
            } else if (pairName === 'R2-R2USD') {
                 tx = await routerContract.removeLiquidity(
                    R2_TOKEN_ADDRESS,
                    R2USD_TOKEN_ADDRESS,
                    amountToBurn,
                    minAmounts[0], // amountAMin (R2)
                    minAmounts[1], // amountBMin (R2USD)
                    wallet.address,
                    deadline,
                    txOptions
                );
            } else {
                 console.error(chalk.red(`❌ Pasangan Uniswap V2 Remove Liquidity tidak didukung: ${pairName}`));
                 return false;
            }


        } else if (routerAddress === CURVE_POOL_ADDRESS_USDC_R2USD || routerAddress === CURVE_POOL_ADDRESS_R2USD_SR2USD) {
            const SLIPPAGE_TOLERANCE_PERCENT_REMOVE = 5.0; // Toleransi slippage untuk remove liquidity

            let expectedToken0, expectedToken1;
            let token0Decimals, token1Decimals; // To get decimals for formatting

            const poolBalances = await routerContract.get_balances();
            const lpTotalSupply = await routerContract.totalSupply();

            let token0Address, token1Address;
            if (routerAddress === CURVE_POOL_ADDRESS_USDC_R2USD) {
                token0Address = R2USD_TOKEN_ADDRESS; // coins(0) on USDC-R2USD pool is R2USD
                token1Address = USDC_TOKEN_ADDRESS;  // coins(1) on USDC-R2USD pool is USDC
            } else { // R2USD-sR2USD
                token0Address = SR2USD_TOKEN_ADDRESS; // coins(0) on R2USD-sR2USD pool is sR2USD
                token1Address = R2USD_TOKEN_ADDRESS;  // coins(1) on R2USD-sR2USD pool is R2USD
            }

            const token0Info = await getERC20TokenInfo(token0Address);
            const token1Info = await getERC20TokenInfo(token1Address);

            token0Decimals = token0Info.decimals;
            token1Decimals = token1Info.decimals;

            if (lpTotalSupply > 0) {
                expectedToken0 = (poolBalances[0] * amountToBurn) / lpTotalSupply;
                expectedToken1 = (poolBalances[1] * amountToBurn) / lpTotalSupply;

                console.log(chalk.blue(`💰 Estimasi terima kembali ${ethers.formatUnits(expectedToken0, token0Decimals)} ${token0Info.symbol} dan ${ethers.formatUnits(expectedToken1, token1Decimals)} ${token1Info.symbol}`));

                const minAmount0 = (expectedToken0 * ethers.toBigInt(Math.floor(10000 - SLIPPAGE_TOLERANCE_PERCENT_REMOVE * 100))) / ethers.toBigInt(10000);
                const minAmount1 = (expectedToken1 * ethers.toBigInt(Math.floor(10000 - SLIPPAGE_TOLERANCE_PERCENT_REMOVE * 100))) / ethers.toBigInt(10000);

                minAmounts = [minAmount0, minAmount1];
            } else {
                console.log(chalk.yellow("⚠️ Total suplai LP token pool adalah nol. Tidak dapat mengestimasi penarikan. Melanjutkan dengan minAmounts = [0,0]."));
                minAmounts = [ethers.toBigInt(0), ethers.toBigInt(0)];
            }
            
            // Curve's remove_liquidity_imbalance takes _amounts (minimums) and _max_burn_amount
            tx = await routerContract['remove_liquidity_imbalance(uint256[],uint256,address)'](
                minAmounts,
                amountToBurn, // This is max_burn_amount for imbalance.
                wallet.address,
                txOptions
            );
        } else {
            console.error(chalk.red(`❌ Router Remove Liquidity tidak dikenal: ${routerAddress}`));
            return false;
        }

        console.log(chalk.blue(`⏳ Mengirim transaksi remove liquidity: ${chalk.underline.blue(`${ETHERSCAN_BASE_URL}tx/${tx.hash}`)}`));
        await tx.wait();
        console.log(chalk.green(`✅ REMOVE LIQUIDITY berhasil! Transaksi: ${chalk.underline.blue(`${ETHERSCAN_BASE_URL}tx/${tx.hash}`)}`));
        return true;
    } catch (error) {
        console.error(chalk.red(`❌ REMOVE LIQUIDITY gagal untuk ${pairName}: ${error.message}`));
        if (error.reason) console.error(chalk.red(`   Reason: ${error.reason}`));
        if (error.code) console.error(chalk.red(`   Ethers.js Code: ${error.code}`));
        if (error.data) console.error(chalk.red(`   Data: ${error.data}`));
        // Add more specific error parsing for Remove Liquidity
        if (error.message.includes("INSUFFICIENT_LIQUIDITY_BURNED")) {
            console.error(chalk.red("   Penyebab Umum: Jumlah LP token yang dibakar tidak cukup atau slippage terlalu ketat."));
        } else if (error.message.includes("MIN_AMOUNT_OUT")) {
            console.error(chalk.red("   Penyebab Umum: Jumlah token yang diterima kurang dari minimum yang diharapkan (slippage terlalu ketat)."));
        } else if (error.message.includes("transaction failed")) {
            console.error(chalk.red("   Penyebab Umum: Transaksi direvert oleh kontrak. Periksa detail di Etherscan."));
        }
        return false;
    }
}


// --- Main Function ---
async function main() {
    console.clear();
    // Custom ASCII Banner
    console.log(
        chalk.green(`
██████╗ ██████╗   ██████╗  █████╗ ████████╗
██╔══██╗╚════██╗  ██╔══██╗██╔══██╗╚══██╔══╝
██████╔╝  ███╔═╝  ██████╦╝██║  ██║   ██║
██╔══██╗██╔══╝    ██╔══██╗██║  ██║   ██║
██║  ██║███████╗  ██████╦╝╚█████╔╝   ██║
╚═╝  ╚═╝╚══════╝  ╚═════╝  ╚════╝    ╚═╝`
        )
    );
    console.log(chalk.cyan(`\n R2 Money Auto Traksaksi Bot`));
    console.log(chalk.cyan(` Script Author: Kazmight `));
    console.log(chalk.cyan(` Alamat Dompet: ${chalk.cyan(wallet.address)}`));

    await displayBalances();

    const { transactionType } = await inquirer.prompt([
        {
            type: 'list',
            name: 'transactionType',
            message: 'Pilih jenis transaksi:',
            choices: [
                'SWAP R2 <-> USDC', // Changed to be more specific
                'ADD LIQUIDITY',
                'REMOVE LIQUIDITY',
                'Keluar'
            ]
        }
    ]);

    if (transactionType === 'Keluar') {
        console.log(chalk.cyan('👋 Sampai jumpa!'));
        process.exit(0);
    }

    const { percentage, numTransactions, delaySeconds } = await inquirer.prompt([
        {
            type: 'input',
            name: 'percentage',
            message: 'Masukkan persentase token yang ingin digunakan (5-100%):', // Changed min from 5 to 1
            validate: value => {
                const num = parseInt(value);
                return num >= 1 && num <= 100 ? true : 'Masukkan angka antara 5 dan 100.';
            },
            filter: Number
        },
        {
            type: 'input',
            name: 'numTransactions',
            message: 'Masukkan berapa kali transaksi ingin dijalankan (1-100):',
            validate: value => {
                const num = parseInt(value);
                return num >= 1 && num <= 100 ? true : 'Masukkan angka antara 1 dan 100.';
            },
            filter: Number
        },
        {
            type: 'input',
            name: 'delaySeconds',
            message: 'Masukkan delay antar transaksi dalam detik (5-100 detik):', // Changed min from 10 to 5
            validate: value => {
                const num = parseInt(value);
                return num >= 5 && num <= 100 ? true : 'Masukkan angka antara 5 dan 100.';
            },
            filter: Number
        }
    ]);

    const delayMs = delaySeconds * 1000;

    console.log(chalk.cyan(`⚙️  Konfigurasi Transaksi:`));
    console.log(chalk.cyan(`💰 Persentase Token: ${chalk.yellow(percentage)}%`));
    console.log(chalk.cyan(`🔢 Jumlah Transaksi: ${chalk.yellow(numTransactions)} kali`));
    console.log(chalk.cyan(`⏱️  Delay Antar Transaksi: ${chalk.yellow(delaySeconds)} detik`));
    console.log(chalk.cyan('----------------------------------'));

    let lastActionSuccess = false;
    let swapDirection = '';
    let liquidityPair = '';
    let selectedLpTokenAddress = '';

    // Prompt for swap direction ONLY ONCE if SWAP is chosen
    if (transactionType === 'SWAP R2 <-> USDC') { // Matches the new specific choice
        const { selectedSwapDirection } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedSwapDirection',
                message: 'Pilih arah SWAP:',
                choices: ['R2 -> USDC', 'USDC -> R2']
            }
        ]);
        swapDirection = selectedSwapDirection;
    }
    // Prompt for liquidity pair ONLY ONCE if ADD/REMOVE LIQUIDITY is chosen
    else if (transactionType === 'ADD LIQUIDITY' || transactionType === 'REMOVE LIQUIDITY') {
        const { selectedLiquidityPair } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedLiquidityPair',
                message: 'Pilih pasangan untuk ' + transactionType + ':',
                choices: ['R2-USDC', 'R2-R2USD', 'USDC-R2USD', 'R2USD-sR2USD']
            }
        ]);
        liquidityPair = selectedLiquidityPair;

        // Determine the correct LP token address corresponding to the chosen pair
        switch (liquidityPair) {
            case 'R2-USDC':
                selectedLpTokenAddress = R2_USDC_LP_CONTRACT_ADDRESS;
                break;
            case 'R2-R2USD':
                selectedLpTokenAddress = R2_R2USD_LP_CONTRACT_ADDRESS;
                break;
            case 'USDC-R2USD':
                selectedLpTokenAddress = USDC_R2USD_LP_CONTRACT_ADDRESS;
                break;
            case 'R2USD-sR2USD':
                selectedLpTokenAddress = R2USD_SR2USD_LP_CONTRACT_ADDRESS;
                break;
        }
    }


    for (let i = 0; i < numTransactions; i++) {
        console.log(chalk.bgCyan(`\n=== Transaksi #${i + 1} / ${numTransactions} ===`));

        if (transactionType === 'SWAP R2 <-> USDC') {
            if (swapDirection === 'R2 -> USDC') {
                lastActionSuccess = await performSwap(
                    R2_TOKEN_ADDRESS,
                    USDC_TOKEN_ADDRESS,
                    percentage,
                    SWAP_ROUTER_ADDRESS_R2_USDC,
                    UNISWAP_V2_ROUTER_ABI
                );
            } else { // USDC -> R2
                lastActionSuccess = await performSwap(
                    USDC_TOKEN_ADDRESS,
                    R2_TOKEN_ADDRESS,
                    percentage,
                    SWAP_ROUTER_ADDRESS_R2_USDC,
                    UNISWAP_V2_ROUTER_ABI
                );
            }
        } else if (transactionType === 'ADD LIQUIDITY') {
            switch (liquidityPair) {
                case 'R2-USDC':
                    lastActionSuccess = await performAddLiquidity(
                        R2_TOKEN_ADDRESS,
                        USDC_TOKEN_ADDRESS,
                        percentage,
                        SWAP_ROUTER_ADDRESS_R2_USDC, // Use the correct router for Uniswap V2-like pairs
                        UNISWAP_V2_ROUTER_ABI,
                        selectedLpTokenAddress
                    );
                    break;
                case 'R2-R2USD':
                    lastActionSuccess = await performAddLiquidity(
                        R2_TOKEN_ADDRESS,
                        R2USD_TOKEN_ADDRESS,
                        percentage,
                        SWAP_ROUTER_ADDRESS_R2_USDC, // Assuming this router handles R2-R2USD as well
                        UNISWAP_V2_ROUTER_ABI,
                        selectedLpTokenAddress
                    );
                    break;
                case 'USDC-R2USD':
                    lastActionSuccess = await performAddLiquidity(
                        USDC_TOKEN_ADDRESS,
                        R2USD_TOKEN_ADDRESS,
                        percentage,
                        CURVE_POOL_ADDRESS_USDC_R2USD, // Use the correct Curve pool address
                        CURVE_POOL_ABI,
                        selectedLpTokenAddress
                    );
                    break;
                case 'R2USD-sR2USD':
                    lastActionSuccess = await performAddLiquidity(
                        R2USD_TOKEN_ADDRESS,
                        SR2USD_TOKEN_ADDRESS,
                        percentage,
                        CURVE_POOL_ADDRESS_R2USD_SR2USD, // Use the correct Curve pool address
                        CURVE_POOL_ABI,
                        selectedLpTokenAddress
                    );
                    break;
            }
        } else if (transactionType === 'REMOVE LIQUIDITY') {
            switch (liquidityPair) {
                case 'R2-USDC':
                    lastActionSuccess = await performRemoveLiquidity(
                        'R2-USDC',
                        selectedLpTokenAddress,
                        percentage,
                        SWAP_ROUTER_ADDRESS_R2_USDC,
                        UNISWAP_V2_ROUTER_ABI
                    );
                    break;
                case 'R2-R2USD':
                    lastActionSuccess = await performRemoveLiquidity(
                        'R2-R2USD',
                        selectedLpTokenAddress,
                        percentage,
                        SWAP_ROUTER_ADDRESS_R2_USDC, // Assuming this router handles R2-R2USD remove liquidity
                        UNISWAP_V2_ROUTER_ABI
                    );
                    break;
                case 'USDC-R2USD':
                    lastActionSuccess = await performRemoveLiquidity(
                        'USDC-R2USD',
                        selectedLpTokenAddress,
                        percentage,
                        CURVE_POOL_ADDRESS_USDC_R2USD,
                        CURVE_POOL_ABI
                    );
                    break;
                case 'R2USD-sR2USD':
                    lastActionSuccess = await performRemoveLiquidity(
                        'R2USD-sR2USD',
                        selectedLpTokenAddress,
                        percentage,
                        CURVE_POOL_ADDRESS_R2USD_SR2USD,
                        CURVE_POOL_ABI
                    );
                    break;
            }
        }

        // Add a delay between transactions only if the last action was successful and it's not the last transaction
        if (i < numTransactions - 1 && lastActionSuccess) {
            console.log(chalk.gray(`\n⏳ Menunggu ${delaySeconds} detik sebelum transaksi berikutnya...`));
            await sleep(delayMs);
        } else if (!lastActionSuccess) {
            console.log(chalk.red(`\n🛑 Transaksi #${i + 1} gagal. Menghentikan transaksi otomatis lebih lanjut.`));
            break; // Stop the loop if a transaction fails
        }
    }

    console.log(chalk.green(`\n🎉 Semua transaksi yang diminta selesai!`));
    await displayBalances();
}

main().catch(error => {
    console.error(chalk.red(`\nFatal Error: ${error.message}`));
    // Log more error details for fatal errors as well
    if (error.reason) console.error(chalk.red(`   Reason: ${error.reason}`));
    if (error.code) console.error(chalk.red(`   Ethers.js Code: ${error.code}`));
    if (error.data) console.error(chalk.red(`   Data: ${error.data}`));
    process.exit(1);
});
