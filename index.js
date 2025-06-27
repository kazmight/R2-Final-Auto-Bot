require('dotenv').config();
const { ethers } = require('ethers');
const inquirer = require('inquirer');
const chalk = require('chalk');
const figlet = require('figlet');

// --- Konfigurasi Blockchain ---
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;

if (!PRIVATE_KEY || !RPC_URL) {
    console.error(chalk.red('❌ Error: PRIVATE_KEY atau RPC_URL tidak ditemukan di file .env'));
    process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const signer = wallet.connect(provider);

// --- Contract Addresses ---
const R2_CONTRACT_ADDRESS = '0xb816bB88f836EA75Ca4071B46FF285f690C43bb7';
const USDC_CONTRACT_ADDRESS = '0x8BEbFCBe5468F146533C182dF3DFbF5ff9BE00E2';
const R2USDC_CONTRACT_ADDRESS = '0x9e8FF356D35a2Da385C546d6Bf1D77ff85133365';
const SR2USDC_CONTRACT_ADDRESS = '0x006CbF409CA275bA022111dB32BDAE054a97d488';

// Interacted With (Router) Addresses
const SWAP_ROUTER_ADDRESS_R2_USDC = '0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3';
const ADD_LIQUIDITY_ROUTER_ADDRESS_R2_USDC = '0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3';
const ADD_LIQUIDITY_ROUTER_ADDRESS_USDC_R2USDC = '0x47d1B0623bB3E557bF8544C159c9ae51D091F8a2';
const ADD_LIQUIDITY_ROUTER_ADDRESS_R2USDC_SR2USDC = '0xe85A06C238439F981c90b2C91393b2F3c46e27FC';

// ABI untuk Token ERC20 dasar (untuk mengecek saldo dan approval)
const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
];

// ABI untuk Swap dan Add Liquidity (yang Anda berikan)
const SWAP_ABI_R2_USDC = [{"inputs":[{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_WETH","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"amountADesired","type":"uint256"},{"internalType":"uint256","name":"amountBDesired","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountTokenDesired","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountIn","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountOut","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsIn","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"reserveA","type":"uint256"},{"internalType":"uint256","name":"reserveB","type":"uint256"}],"name":"quote","outputs":[{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETHSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermit","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermitSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityWithPermit","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapETHForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETHSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

const ADD_LIQUIDITY_ABI_USDC_R2USDC = [{"name":"Transfer","inputs":[{"name":"sender","type":"address","indexed":true},{"name":"receiver","type":"address","indexed":true},{"name":"value","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"Approval","inputs":[{"name":"owner","type":"address","indexed":true},{"name":"spender","type":"address","indexed":true},{"name":"value","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"TokenExchange","inputs":[{"name":"buyer","type":"address","indexed":true},{"name":"sold_id","type":"int128","indexed":false},{"name":"tokens_sold","type":"uint256","indexed":false},{"name":"bought_id","type":"int128","indexed":false},{"name":"tokens_bought","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"TokenExchangeUnderlying","inputs":[{"name":"buyer","type":"address","indexed":true},{"name":"sold_id","type":"int128","indexed":false},{"name":"tokens_sold","type":"uint256","indexed":false},{"name":"bought_id","type":"int128","indexed":false},{"name":"tokens_bought","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"AddLiquidity","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_amounts","type":"uint256[]","indexed":false},{"name":"fees","type":"uint256[]","indexed":false},{"name":"invariant","type":"uint256","indexed":false},{"name":"token_supply","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"RemoveLiquidity","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_amounts","type":"uint256[]","indexed":false},{"name":"fees","type":"uint256[]","indexed":false},{"name":"token_supply","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"RemoveLiquidityOne","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_id","type":"int128","indexed":false},{"name":"token_amount","type":"uint256","indexed":false},{"name":"coin_amount","type":"uint256","indexed":false},{"name":"token_supply","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"RemoveLiquidityImbalance","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_amounts","type":"uint256[]","indexed":false},{"name":"fees","type":"uint256[]","indexed":false},{"name":"invariant","type":"uint256","indexed":false},{"name":"token_supply","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"RampA","inputs":[{"name":"old_A","type":"uint256","indexed":false},{"name":"new_A","type":"uint256","indexed":false},{"name":"initial_time","type":"uint256","indexed":false},{"name":"future_time","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"StopRampA","inputs":[{"name":"A","type":"uint256","indexed":false},{"name":"t","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"ApplyNewFee","inputs":[{"name":"fee","type":"uint256","indexed":false},{"name":"offpeg_fee_multiplier","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"SetNewMATime","inputs":[{"name":"ma_exp_time","type":"uint256","indexed":false},{"name":"D_ma_time","type":"uint256","indexed":"false"}],"anonymous":false,"type":"event"},{"stateMutability":"nonpayable","type":"constructor","inputs":[{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_A","type":"uint256"},{"name":"_fee","type":"uint256"},{"name":"_offpeg_fee_multiplier","type":"uint256"},{"name":"_ma_exp_time","type":"uint256"},{"name":"_coins","type":"address[]"},{"name":"_rate_multipliers","type":"uint256[]"},{"name":"_asset_types","type":"uint8[]"},{"name":"_method_ids","type":"bytes4[]"},{"name":"_oracles","type":"address[]"}],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"exchange","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"_dx","type":"uint256"},{"name":"_min_dy","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"exchange","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"_dx","type":"uint256"},{"name":"_min_dy","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"exchange_received","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"_dx","type":"uint256"},{"name":"_min_dy","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"exchange_received","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"_dx","type":"uint256"},{"name":"_min_dy","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"add_liquidity","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_min_mint_amount","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"add_liquidity","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_min_mint_amount","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity_one_coin","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"i","type":"int128"},{"name":"_min_received","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity_one_coin","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"i","type":"int128"},{"name":"_min_received","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity_imbalance","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_max_burn_amount","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity_imbalance","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_max_burn_amount","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"_min_amounts","type":"uint256[]"}],"outputs":[{"name":"","type":"uint256[]"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"_min_amounts","type":"uint256[]"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256[]"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"_min_amounts","type":"uint256[]"},{"name":"_receiver","type":"address"},{"name":"_claim_admin_fees","type":"bool"}],"outputs":[{"name":"","type":"uint256[]"}]},{"stateMutability":"nonpayable","type":"function","name":"withdraw_admin_fees","inputs":[],"outputs":[]},{"stateMutability":"view","type":"function","name":"last_price","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"ema_price","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"get_p","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"price_oracle","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"D_oracle","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"transfer","inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"nonpayable","type":"function","name":"transferFrom","inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"nonpayable","type":"function","name":"approve","inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"nonpayable","type":"function","name":"permit","inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"},{"name":"_deadline","type":"uint256"},{"name":"_v","type":"uint8"},{"name":"_r","type":"bytes32"},{"name":"_s","type":"bytes32"}],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"view","type":"function","name":"DOMAIN_SEPARATOR","inputs":[],"outputs":[{"name":"","type":"bytes32"}]},{"stateMutability":"view","type":"function","name":"get_dx","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"dy","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"get_dy","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"dx","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"calc_withdraw_one_coin","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"i","type":"int128"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"totalSupply","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"get_virtual_price","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"calc_token_amount","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_is_deposit","type":"bool"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"A","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"A_precise","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"balances","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"get_balances","inputs":[],"outputs":[{"name":"","type":"uint256[]"}]},{"stateMutability":"view","type":"function","name":"stored_rates","inputs":[],"outputs":[{"name":"","type":"uint256[]"}]},{"stateMutability":"view","type":"function","name":"dynamic_fee","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"ramp_A","inputs":[{"name":"_future_A","type":"uint256"},{"name":"_future_time","type":"uint256"}],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"stop_ramp_A","inputs":[],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"set_new_fee","inputs":[{"name":"_new_fee","type":"uint256"},{"name":"_new_offpeg_fee_multiplier","type":"uint256"}],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"set_ma_exp_time","inputs":[{"name":"_ma_exp_time","type":"uint256"},{"name":"_D_ma_time","type":"uint256"}],"outputs":[]},{"stateMutability":"view","type":"function","name":"N_COINS","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"coins","inputs":[{"name":"arg0","type":"uint256"}],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"fee","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"offpeg_fee_multiplier","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"admin_fee","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"initial_A","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"future_A","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"initial_A_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"future_A_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"admin_balances","inputs":[{"name":"arg0","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"ma_exp_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"D_ma_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"ma_last_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"name","inputs":[],"outputs":[{"name":"","type":"string"}]},{"stateMutability":"view","type":"function","name":"symbol","inputs":[],"outputs":[{"name":"","type":"string"}]},{"stateMutability":"view","type":"function","name":"decimals","inputs":[],"outputs":[{"name":"","type":"uint8"}]},{"stateMutability":"view","type":"function","name":"version","inputs":[],"outputs":[{"name":"","type":"string"}]},{"stateMutability":"view","type":"function","name":"balanceOf","inputs":[{"name":"arg0","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"allowance","inputs":[{"name":"arg0","type":"address"},{"name":"arg1","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"nonces","inputs":[{"name":"arg0","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"salt","inputs":[],"outputs":[{"name":"","type":"bytes32"}]}];


const ADD_LIQUIDITY_ABI_R2_R2USDC = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount0Out","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1Out","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Swap","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint112","name":"reserve0","type":"uint112"},{"indexed":false,"internalType":"uint112","name":"reserve1","type":"uint112"}],"name":"Sync","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MINIMUM_LIQUIDITY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"burn","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getReserves","outputs":[{"internalType":"uint112","name":"_reserve0","type":"uint112"},{"internalType":"uint112","name":"_reserve1","type":"uint112"},{"internalType":"uint32","name":"_blockTimestampLast","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_token0","type":"address"},{"internalType":"address","name":"_token1","type":"address"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"mint","outputs":[{"internalType":"uint256","name":"liquidity","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"price0CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"price1CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"skim","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount0Out","type":"uint256"},{"internalType":"uint256","name":"amount1Out","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"swap","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"sync","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]

const ADD_LIQUIDITY_ABI_R2USDC_SR2USDC = [{"name":"Transfer","inputs":[{"name":"sender","type":"address","indexed":true},{"name":"receiver","type":"address","indexed":true},{"name":"value","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"Approval","inputs":[{"name":"owner","type":"address","indexed":true},{"name":"spender","type":"address","indexed":true},{"name":"value","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"TokenExchange","inputs":[{"name":"buyer","type":"address","indexed":true},{"name":"sold_id","type":"int128","indexed":false},{"name":"tokens_sold","type":"uint256","indexed":false},{"name":"bought_id","type":"int128","indexed":false},{"name":"tokens_bought","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"TokenExchangeUnderlying","inputs":[{"name":"buyer","type":"address","indexed":true},{"name":"sold_id","type":"int128","indexed":false},{"name":"tokens_sold","type":"uint256","indexed":false},{"name":"bought_id","type":"int128","indexed":false},{"name":"tokens_bought","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"AddLiquidity","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_amounts","type":"uint256[]","indexed":false},{"name":"fees","type":"uint256[]","indexed":false},{"name":"invariant","type":"uint256","indexed":false},{"name":"token_supply","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"RemoveLiquidity","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_amounts","type":"uint256[]","indexed":false},{"name":"fees","type":"uint256[]","indexed":false},{"name":"token_supply","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"RemoveLiquidityOne","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_id","type":"int128","indexed":false},{"name":"token_amount","type":"uint256","indexed":false},{"name":"coin_amount","type":"uint256","indexed":false},{"name":"token_supply","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"RemoveLiquidityImbalance","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_amounts","type":"uint256[]","indexed":false},{"name":"fees","type":"uint256[]","indexed":false},{"name":"invariant","type":"uint256","indexed":false},{"name":"token_supply","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"RampA","inputs":[{"name":"old_A","type":"uint256","indexed":false},{"name":"new_A","type":"uint256","indexed":false},{"name":"initial_time","type":"uint256","indexed":false},{"name":"future_time","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"StopRampA","inputs":[{"name":"A","type":"uint256","indexed":false},{"name":"t","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"ApplyNewFee","inputs":[{"name":"fee","type":"uint256","indexed":false},{"name":"offpeg_fee_multiplier","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"SetNewMATime","inputs":[{"name":"ma_exp_time","type":"uint256","indexed":false},{"name":"D_ma_time","type":"uint256","indexed":"false"}],"anonymous":false,"type":"event"},{"stateMutability":"nonpayable","type":"constructor","inputs":[{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_A","type":"uint256"},{"name":"_fee","type":"uint256"},{"name":"_offpeg_fee_multiplier","type":"uint256"},{"name":"_ma_exp_time","type":"uint256"},{"name":"_coins","type":"address[]"},{"name":"_rate_multipliers","type":"uint256[]"},{"name":"_asset_types","type":"uint8[]"},{"name":"_method_ids","type":"bytes4[]"},{"name":"_oracles","type":"address[]"}],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"exchange","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"_dx","type":"uint256"},{"name":"_min_dy","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"exchange","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"_dx","type":"uint256"},{"name":"_min_dy","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"exchange_received","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"_dx","type":"uint256"},{"name":"_min_dy","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"exchange_received","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"_dx","type":"uint256"},{"name":"_min_dy","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"add_liquidity","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_min_mint_amount","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"add_liquidity","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_min_mint_amount","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity_one_coin","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"i","type":"int128"},{"name":"_min_received","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity_one_coin","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"i","type":"int128"},{"name":"_min_received","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity_imbalance","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_max_burn_amount","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity_imbalance","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_max_burn_amount","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"_min_amounts","type":"uint256[]"}],"outputs":[{"name":"","type":"uint256[]"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"_min_amounts","type":"uint256[]"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256[]"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"_min_amounts","type":"uint256[]"},{"name":"_receiver","type":"address"},{"name":"_claim_admin_fees","type":"bool"}],"outputs":[{"name":"","type":"uint256[]"}]},{"stateMutability":"nonpayable","type":"function","name":"withdraw_admin_fees","inputs":[],"outputs":[]},{"stateMutability":"view","type":"function","name":"last_price","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"ema_price","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"get_p","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"price_oracle","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"D_oracle","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"transfer","inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"nonpayable","type":"function","name":"transferFrom","inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"nonpayable","type":"function","name":"approve","inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"nonpayable","type":"function","name":"permit","inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"},{"name":"_deadline","type":"uint256"},{"name":"_v","type":"uint8"},{"name":"_r","type":"bytes32"},{"name":"_s","type":"bytes32"}],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"view","type":"function","name":"DOMAIN_SEPARATOR","inputs":[],"outputs":[{"name":"","type":"bytes32"}]},{"stateMutability":"view","type":"function","name":"get_dx","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"dy","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"get_dy","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"dx","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"calc_withdraw_one_coin","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"i","type":"int128"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"totalSupply","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"get_virtual_price","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"calc_token_amount","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_is_deposit","type":"bool"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"A","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"A_precise","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"balances","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"get_balances","inputs":[],"outputs":[{"name":"","type":"uint256[]"}]},{"stateMutability":"view","type":"function","name":"stored_rates","inputs":[],"outputs":[{"name":"","type":"uint256[]"}]},{"stateMutability":"view","type":"function","name":"dynamic_fee","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"ramp_A","inputs":[{"name":"_future_A","type":"uint256"},{"name":"_future_time","type":"uint256"}],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"stop_ramp_A","inputs":[],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"set_new_fee","inputs":[{"name":"_new_fee","type":"uint256"},{"name":"_new_offpeg_fee_multiplier","type":"uint256"}],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"set_ma_exp_time","inputs":[{"name":"_ma_exp_time","type":"uint256"},{"name":"_D_ma_time","type":"uint256"}],"outputs":[]},{"stateMutability":"view","type":"function","name":"N_COINS","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"coins","inputs":[{"name":"arg0","type":"uint256"}],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"fee","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"offpeg_fee_multiplier","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"admin_fee","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"initial_A","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"future_A","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"initial_A_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"future_A_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"admin_balances","inputs":[{"name":"arg0","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"ma_exp_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"D_ma_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"ma_last_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"name","inputs":[],"outputs":[{"name":"","type":"string"}]},{"stateMutability":"view","type":"function","name":"symbol","inputs":[],"outputs":[{"name":"","type":"string"}]},{"stateMutability":"view","type":"function","name":"decimals","inputs":[],"outputs":[{"name":"","type":"uint8"}]},{"stateMutability":"view","type":"function","name":"version","inputs":[],"outputs":[{"name":"","type":"string"}]},{"stateMutability":"view","type":"function","name":"balanceOf","inputs":[{"name":"arg0","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"allowance","inputs":[{"name":"arg0","type":"address"},{"name":"arg1","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"nonces","inputs":[{"name":"arg0","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"salt","inputs":[],"outputs":[{"name":"","type":"bytes32"}]}];


// --- Fungsi Pembantu ---

async function getERC20TokenInfo(tokenAddress) {
    try {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const symbol = await tokenContract.symbol();
        const decimals = await tokenContract.decimals();
        const balance = await tokenContract.balanceOf(wallet.address);
        return { symbol, decimals, balance };
    } catch (error) {
        return { symbol: `Unknown (${tokenAddress.substring(0, 6)}...)`, decimals: 18, balance: ethers.toBigInt(0) }; // Default to 18 decimals if unable to fetch
    }
}

async function displayBalances() {
    console.log(chalk.cyan(`\n✨ Saldo Token Anda (${wallet.address}):`));
    const tokens = [
        { name: 'R2', address: R2_CONTRACT_ADDRESS },
        { name: 'USDC', address: USDC_CONTRACT_ADDRESS },
        { name: 'R2USDC', address: R2USDC_CONTRACT_ADDRESS },
        { name: 'sR2USDC', address: SR2USDC_CONTRACT_ADDRESS },
    ];

    for (const token of tokens) {
        const info = await getERC20TokenInfo(token.address);
        const formattedBalance = ethers.formatUnits(info.balance, info.decimals);
        console.log(chalk.yellow(`  ${info.symbol}: ${formattedBalance}`));
    }
    console.log(chalk.cyan('----------------------------------'));
}

async function approveToken(tokenAddress, spenderAddress, amount) {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    try {
        console.log(chalk.blue(`\n🚀 Meminta persetujuan untuk ${await tokenContract.symbol()}...`));
        const tx = await tokenContract.approve(spenderAddress, amount);
        await tx.wait();
        console.log(chalk.green(`✅ Persetujuan ${await tokenContract.symbol()} berhasil! Transaksi: ${chalk.underline.blue(`${RPC_URL.split('/').slice(0,3).join('/')}/tx/${tx.hash}`)}`));
        return true;
    } catch (error) {
        console.error(chalk.red(`❌ Gagal menyetujui token ${await tokenContract.symbol()}: ${error.message}`));
        return false;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Fungsi Swap ---

async function performSwap(tokenInAddress, tokenOutAddress, amountPercentage, routerAddress, abi, methodId) {
    console.log(chalk.magenta(`\n💫 Memulai SWAP...`));
    const tokenInInfo = await getERC20TokenInfo(tokenInAddress);
    const tokenOutInfo = await getERC20TokenInfo(tokenOutAddress);

    if (tokenInInfo.balance === ethers.toBigInt(0)) {
        console.log(chalk.yellow(`⚠️ Anda tidak memiliki ${tokenInInfo.symbol} untuk di-swap.`));
        return false;
    }

    const amountToSwap = (tokenInInfo.balance * ethers.toBigInt(amountPercentage)) / ethers.toBigInt(100);
    const formattedAmountToSwap = ethers.formatUnits(amountToSwap, tokenInInfo.decimals);

    console.log(chalk.yellow(`🔄 Akan melakukan swap ${formattedAmountToSwap} ${tokenInInfo.symbol} menjadi ${tokenOutInfo.symbol}`));

    // Approve the router to spend tokens
    const approvalSuccess = await approveToken(tokenInAddress, routerAddress, amountToSwap);
    if (!approvalSuccess) {
        return false;
    }

    const routerContract = new ethers.Contract(routerAddress, abi, signer);

    try {
        let tx;
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

        if (tokenInAddress === R2_CONTRACT_ADDRESS && tokenOutAddress === USDC_CONTRACT_ADDRESS) {
            // This assumes a `swapExactTokensForTokens` or similar method
            // The ABI you provided for SWAP_ABI_R2_USDC has multiple swap functions.
            // We need to pick the correct one based on your `methodId: 0x38ed1739`.
            // The method 0x38ed1739 typically corresponds to `swapExactTokensForTokens`.
            console.log(chalk.blue(`Sending swapExactTokensForTokens transaction...`));
            const path = [tokenInAddress, tokenOutAddress]; // Path for swap R2 -> USDC
            const amountOutMin = 0; // Set to 0 for simplicity, ideally calculate slippage tolerance
            tx = await routerContract.swapExactTokensForTokens(
                amountToSwap,
                amountOutMin,
                path,
                wallet.address,
                deadline
            );
        } else if (tokenInAddress === USDC_CONTRACT_ADDRESS && tokenOutAddress === R2_CONTRACT_ADDRESS) {
            console.log(chalk.blue(`Sending swapExactTokensForTokens transaction (reverse)...`));
            const path = [tokenInAddress, tokenOutAddress]; // Path for swap USDC -> R2
            const amountOutMin = 0; // Set to 0 for simplicity, ideally calculate slippage tolerance
            tx = await routerContract.swapExactTokensForTokens(
                amountToSwap,
                amountOutMin,
                path,
                wallet.address,
                deadline
            );
        } else {
            console.error(chalk.red(`❌ Pasangan swap tidak didukung dalam fungsi ini.`));
            return false;
        }

        console.log(chalk.blue(`⏳ Mengirim transaksi swap: ${chalk.underline.blue(`${RPC_URL.split('/').slice(0,3).join('/')}/tx/${tx.hash}`)}`));
        await tx.wait();
        console.log(chalk.green(`✅ SWAP berhasil! Transaksi: ${chalk.underline.blue(`${RPC_URL.split('/').slice(0,3).join('/')}/tx/${tx.hash}`)}`));
        return true;
    } catch (error) {
        console.error(chalk.red(`❌ SWAP gagal: ${error.message}`));
        return false;
    }
}

// --- Fungsi Add Liquidity ---

async function performAddLiquidity(tokenAAddress, tokenBAddress, amountPercentage, routerAddress, abi) {
    console.log(chalk.magenta(`\n💧 Memulai ADD LIQUIDITY...`));
    const tokenAInfo = await getERC20TokenInfo(tokenAAddress);
    const tokenBInfo = await getERC20TokenInfo(tokenBAddress);

    if (tokenAInfo.balance === ethers.toBigInt(0) || tokenBInfo.balance === ethers.toBigInt(0)) {
        console.log(chalk.yellow(`⚠️ Anda tidak memiliki cukup ${tokenAInfo.symbol} atau ${tokenBInfo.symbol} untuk menambah likuiditas.`));
        return false;
    }

    const amountADesired = (tokenAInfo.balance * ethers.toBigInt(amountPercentage)) / ethers.toBigInt(100);
    const amountBDesired = (tokenBInfo.balance * ethers.toBigInt(amountPercentage)) / ethers.toBigInt(100);

    console.log(chalk.yellow(`💦 Akan menambahkan ${ethers.formatUnits(amountADesired, tokenAInfo.decimals)} ${tokenAInfo.symbol} dan ${ethers.formatUnits(amountBDesired, tokenBInfo.decimals)} ${tokenBInfo.symbol} ke likuiditas.`));

    // Approve the router to spend both tokens
    let approvalSuccessA = await approveToken(tokenAAddress, routerAddress, amountADesired);
    if (!approvalSuccessA) return false;

    let approvalSuccessB = await approveToken(tokenBAddress, routerAddress, amountBDesired);
    if (!approvalSuccessB) return false;

    const routerContract = new ethers.Contract(routerAddress, abi, signer);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

    try {
        let tx;
        if (routerAddress === SWAP_ROUTER_ADDRESS_R2_USDC) {
            // This router ABI has `addLiquidity` method.
            tx = await routerContract.addLiquidity(
                tokenAAddress,
                tokenBAddress,
                amountADesired,
                amountBDesired,
                0, // amountAMin, set to 0 for simplicity, ideally calculate slippage tolerance
                0, // amountBMin, set to 0 for simplicity, ideally calculate slippage tolerance
                wallet.address,
                deadline
            );
        } else if (routerAddress === ADD_LIQUIDITY_ROUTER_ADDRESS_USDC_R2USDC || routerAddress === ADD_LIQUIDITY_ROUTER_ADDRESS_R2USDC_SR2USDC) {
            // For Curve-like pools, the add_liquidity method expects an array of amounts.
            // We need to determine the correct index for each token within the pool's coins array.
            // This is a simplification and might need adjustment based on the exact pool implementation.
            console.log(chalk.blue(`Sending add_liquidity transaction to Curve-like pool...`));
            const amounts = [amountADesired, amountBDesired]; // Assuming order based on common practice
            const minMintAmount = 0; // Set to 0 for simplicity

            tx = await routerContract.add_liquidity(
                amounts,
                minMintAmount,
                wallet.address
            );
        } else {
            console.error(chalk.red(`❌ Router Add Liquidity tidak dikenal: ${routerAddress}`));
            return false;
        }


        console.log(chalk.blue(`⏳ Mengirim transaksi add liquidity: ${chalk.underline.blue(`${RPC_URL.split('/').slice(0,3).join('/')}/tx/${tx.hash}`)}`));
        await tx.wait();
        console.log(chalk.green(`✅ ADD LIQUIDITY berhasil! Transaksi: ${chalk.underline.blue(`${RPC_URL.split('/').slice(0,3).join('/')}/tx/${tx.hash}`)}`));
        return true;
    } catch (error) {
        console.error(chalk.red(`❌ ADD LIQUIDITY gagal: ${error.message}`));
        return false;
    }
}

// --- Fungsi Remove Liquidity ---

async function performRemoveLiquidity(tokenAAddress, tokenBAddress, liquidityPoolAddress, amountPercentage, routerAddress, abi) {
    console.log(chalk.magenta(`\n🗑️ Memulai REMOVE LIQUIDITY...`));

    const lpTokenInfo = await getERC20TokenInfo(liquidityPoolAddress);

    if (lpTokenInfo.balance === ethers.toBigInt(0)) {
        console.log(chalk.yellow(`⚠️ Anda tidak memiliki LP token (${lpTokenInfo.symbol}) untuk dihapus likuiditasnya.`));
        return false;
    }

    const amountToBurn = (lpTokenInfo.balance * ethers.toBigInt(amountPercentage)) / ethers.toBigInt(100);
    const formattedAmountToBurn = ethers.formatUnits(amountToBurn, lpTokenInfo.decimals);

    console.log(chalk.yellow(`🔥 Akan menghapus likuiditas sebanyak ${formattedAmountToBurn} LP token (${lpTokenInfo.symbol}).`));

    // Approve the router to spend LP tokens
    const approvalSuccess = await approveToken(liquidityPoolAddress, routerAddress, amountToBurn);
    if (!approvalSuccess) {
        return false;
    }

    const routerContract = new ethers.Contract(routerAddress, abi, signer);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

    try {
        let tx;
        if (routerAddress === SWAP_ROUTER_ADDRESS_R2_USDC) {
            // For standard Uniswap V2 like routers
            tx = await routerContract.removeLiquidity(
                tokenAAddress,
                tokenBAddress,
                amountToBurn,
                0, // amountAMin
                0, // amountBMin
                wallet.address,
                deadline
            );
        } else if (routerAddress === ADD_LIQUIDITY_ROUTER_ADDRESS_USDC_R2USDC || routerAddress === ADD_LIQUIDITY_ROUTER_ADDRESS_R2USDC_SR2USDC) {
            // For Curve-like pools, you would typically use `remove_liquidity` or `remove_liquidity_one_coin`.
            // `remove_liquidity` expects min_amounts for all coins.
            // Let's assume remove_liquidity for simplicity, with 0 min amounts.
            console.log(chalk.blue(`Sending remove_liquidity transaction to Curve-like pool...`));
            const minAmounts = [0, 0]; // Placeholder, needs actual logic to calculate minimums
            tx = await routerContract.remove_liquidity(
                amountToBurn,
                minAmounts,
                wallet.address
            );
        } else {
            console.error(chalk.red(`❌ Router Remove Liquidity tidak dikenal: ${routerAddress}`));
            return false;
        }

        console.log(chalk.blue(`⏳ Mengirim transaksi remove liquidity: ${chalk.underline.blue(`${RPC_URL.split('/').slice(0,3).join('/')}/tx/${tx.hash}`)}`));
        await tx.wait();
        console.log(chalk.green(`✅ REMOVE LIQUIDITY berhasil! Transaksi: ${chalk.underline.blue(`${RPC_URL.split('/').slice(0,3).join('/')}/tx/${tx.hash}`)}`));
        return true;
    } catch (error) {
        console.error(chalk.red(`❌ REMOVE LIQUIDITY gagal: ${error.message}`));
        return false;
    }
}


// --- Main Function ---
async function main() {
    console.clear();
    console.log(
        chalk.green(
            figlet.textSync('DeFi Bot', { horizontalLayout: 'full' })
        )
    );
    console.log(chalk.cyan(`\n👋 Selamat datang di Bot DeFi Anda!`));
    console.log(chalk.cyan(`👤 Alamat Dompet: ${chalk.yellow(wallet.address)}`));

    await displayBalances();

    const { transactionType } = await inquirer.prompt([
        {
            type: 'list',
            name: 'transactionType',
            message: 'Pilih jenis transaksi:',
            choices: [
                'SWAP R2 <-> USDC',
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
            message: 'Masukkan persentase token yang ingin digunakan (1-100%):',
            validate: value => {
                const num = parseInt(value);
                return num >= 1 && num <= 100 ? true : 'Masukkan angka antara 1 dan 100.';
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
            message: 'Masukkan delay antar transaksi dalam detik (5-100 detik):',
            validate: value => {
                const num = parseInt(value);
                return num >= 5 && num <= 100 ? true : 'Masukkan angka antara 5 dan 100.';
            },
            filter: Number
        }
    ]);

    const delayMs = delaySeconds * 1000;

    console.log(chalk.cyan(`\n⚙️ Konfigurasi Transaksi:`));
    console.log(chalk.cyan(`  💰 Persentase Token: ${chalk.yellow(percentage)}%`));
    console.log(chalk.cyan(`  🔢 Jumlah Transaksi: ${chalk.yellow(numTransactions)} kali`));
    console.log(chalk.cyan(`  ⏱️ Delay Antar Transaksi: ${chalk.yellow(delaySeconds)} detik`));
    console.log(chalk.cyan('----------------------------------'));

    let swapSuccess = false;
    let addLiquiditySuccess = false;

    for (let i = 0; i < numTransactions; i++) {
        console.log(chalk.bgCyan(`\n=== Transaksi #${i + 1} / ${numTransactions} ===`));

        if (transactionType === 'SWAP R2 <-> USDC') {
            const { swapDirection } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'swapDirection',
                    message: 'Pilih arah SWAP:',
                    choices: ['R2 -> USDC', 'USDC -> R2']
                }
            ]);

            if (swapDirection === 'R2 -> USDC') {
                swapSuccess = await performSwap(
                    R2_CONTRACT_ADDRESS,
                    USDC_CONTRACT_ADDRESS,
                    percentage,
                    SWAP_ROUTER_ADDRESS_R2_USDC,
                    SWAP_ABI_R2_USDC,
                    '0x38ed1739' // swapExactTokensForTokens
                );
            } else { // USDC -> R2
                swapSuccess = await performSwap(
                    USDC_CONTRACT_ADDRESS,
                    R2_CONTRACT_ADDRESS,
                    percentage,
                    SWAP_ROUTER_ADDRESS_R2_USDC,
                    SWAP_ABI_R2_USDC,
                    '0x38ed1739' // swapExactTokensForTokens
                );
            }
        } else if (transactionType === 'ADD LIQUIDITY') {
            const { liquidityPair } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'liquidityPair',
                    message: 'Pilih pasangan untuk ADD LIQUIDITY:',
                    choices: ['R2-USDC', 'R2-R2USDC', 'USDC-R2USDC', 'R2USDC-sR2USDC']
                }
            ]);

            switch (liquidityPair) {
                case 'R2-USDC':
                    addLiquiditySuccess = await performAddLiquidity(
                        R2_CONTRACT_ADDRESS,
                        USDC_CONTRACT_ADDRESS,
                        percentage,
                        ADD_LIQUIDITY_ROUTER_ADDRESS_R2_USDC,
                        SWAP_ABI_R2_USDC // This ABI has addLiquidity function
                    );
                    break;
                case 'R2-R2USDC':
                    addLiquiditySuccess = await performAddLiquidity(
                        R2_CONTRACT_ADDRESS,
                        R2USDC_CONTRACT_ADDRESS,
                        percentage,
                        ADD_LIQUIDITY_ROUTER_ADDRESS_R2_USDC, // Assuming this router handles R2-R2USDC for addLiquidity
                        ADD_LIQUIDITY_ABI_R2_R2USDC
                    );
                    break;
                case 'USDC-R2USDC':
                    addLiquiditySuccess = await performAddLiquidity(
                        USDC_CONTRACT_ADDRESS,
                        R2USDC_CONTRACT_ADDRESS,
                        percentage,
                        ADD_LIQUIDITY_ROUTER_ADDRESS_USDC_R2USDC,
                        ADD_LIQUIDITY_ABI_USDC_R2USDC
                    );
                    break;
                case 'R2USDC-sR2USDC':
                    addLiquiditySuccess = await performAddLiquidity(
                        R2USDC_CONTRACT_ADDRESS,
                        SR2USDC_CONTRACT_ADDRESS,
                        percentage,
                        ADD_LIQUIDITY_ROUTER_ADDRESS_R2USDC_SR2USDC,
                        ADD_LIQUIDITY_ABI_R2USDC_SR2USDC
                    );
                    break;
            }
        }

        // Only attempt remove liquidity if a swap or add liquidity was successful
        if (transactionType === 'REMOVE LIQUIDITY' || swapSuccess || addLiquiditySuccess) {
            if (transactionType === 'REMOVE LIQUIDITY') {
                const { removeLiquidityPair } = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'removeLiquidityPair',
                        message: 'Pilih pasangan untuk REMOVE LIQUIDITY:',
                        choices: ['R2-USDC', 'R2-R2USDC', 'USDC-R2USDC', 'R2USDC-sR2USDC']
                    }
                ]);

                switch (removeLiquidityPair) {
                    case 'R2-USDC':
                        // For R2-USDC, the LP token is created by the router 0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3 (Uniswap V2 factory typically)
                        // We need to find the address of the specific LP token for R2-USDC pair.
                        // This usually involves calling a `getPair` function on the factory contract.
                        // For simplicity in this example, I'll use a placeholder.
                        // In a real scenario, you'd need the factory ABI and call getPair(R2_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS)
                        console.log(chalk.yellow("🚧 Mencari alamat LP token untuk R2-USDC. Ini mungkin memerlukan panggilan ke kontrak factory. Untuk demo, asumsikan ada LP token yang tersedia."));
                        // Placeholder: you'd get this from the factory getPair method
                        const R2_USDC_LP_TOKEN_ADDRESS = '0xYourR2USDC_LP_TokenAddressHere'; // <<< YOU NEED TO FIND THIS LP TOKEN ADDRESS
                        if (R2_USDC_LP_TOKEN_ADDRESS === '0xYourR2USDC_LP_TokenAddressHere') {
                            console.error(chalk.red("⛔ LP Token Address untuk R2-USDC belum ditentukan. Tidak bisa melanjutkan remove liquidity."));
                        } else {
                            await performRemoveLiquidity(
                                R2_CONTRACT_ADDRESS,
                                USDC_CONTRACT_ADDRESS,
                                R2_USDC_LP_TOKEN_ADDRESS,
                                percentage,
                                SWAP_ROUTER_ADDRESS_R2_USDC,
                                SWAP_ABI_R2_USDC
                            );
                        }
                        break;
                    case 'R2-R2USDC':
                        // Similarly, find the LP token address for R2-R2USDC
                        console.log(chalk.yellow("🚧 Mencari alamat LP token untuk R2-R2USDC."));
                        const R2_R2USDC_LP_TOKEN_ADDRESS = R2USDC_CONTRACT_ADDRESS; // If R2USDC itself is the LP token for R2-R2USDC pool
                        await performRemoveLiquidity(
                            R2_CONTRACT_ADDRESS,
                            R2USDC_CONTRACT_ADDRESS,
                            R2_R2USDC_LP_TOKEN_ADDRESS,
                            percentage,
                            ADD_LIQUIDITY_ROUTER_ADDRESS_R2_USDC, // Assuming this router handles removeLiquidity for R2-R2USDC
                            ADD_LIQUIDITY_ABI_R2_R2USDC
                        );
                        break;
                    case 'USDC-R2USDC':
                        console.log(chalk.yellow("🚧 Mencari alamat LP token untuk USDC-R2USDC."));
                        const USDC_R2USDC_LP_TOKEN_ADDRESS = R2USDC_CONTRACT_ADDRESS; // This might be the case for Curve-like pools
                        await performRemoveLiquidity(
                            USDC_CONTRACT_ADDRESS,
                            R2USDC_CONTRACT_ADDRESS,
                            USDC_R2USDC_LP_TOKEN_ADDRESS,
                            percentage,
                            ADD_LIQUIDITY_ROUTER_ADDRESS_USDC_R2USDC,
                            ADD_LIQUIDITY_ABI_USDC_R2USDC
                        );
                        break;
                    case 'R2USDC-sR2USDC':
                        console.log(chalk.yellow("🚧 Mencari alamat LP token untuk R2USDC-sR2USDC."));
                        const R2USDC_SR2USDC_LP_TOKEN_ADDRESS = SR2USDC_CONTRACT_ADDRESS; // This might be the case for Curve-like pools
                        await performRemoveLiquidity(
                            R2USDC_CONTRACT_ADDRESS,
                            SR2USDC_CONTRACT_ADDRESS,
                            R2USDC_SR2USDC_LP_TOKEN_ADDRESS,
                            percentage,
                            ADD_LIQUIDITY_ROUTER_ADDRESS_R2USDC_SR2USDC,
                            ADD_LIQUIDITY_ABI_R2USDC_SR2USDC
                        );
                        break;
                }
            }
        }

        if (i < numTransactions - 1) {
            console.log(chalk.gray(`\n⏳ Menunggu ${delaySeconds} detik sebelum transaksi berikutnya...`));
            await delay(delayMs);
        }
    }

    console.log(chalk.green(`\n🎉 Semua transaksi selesai!`));
    await displayBalances();
}

main().catch(error => {
    console.error(chalk.red(`\nFatal Error: ${error.message}`));
    process.exit(1);
});
