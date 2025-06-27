// Load environment variables from .env file
require('dotenv').config();

const { ethers } = require('ethers');

// --- Konfigurasi Utama (Semua digabung di sini) ---
// Perbarui nilai-nilai ini sesuai kebutuhan Anda!
const CONFIG = {
    // Kredensial Dompet & RPC
    SEPOLIA_RPC_URL: "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID", // Ganti dengan ID proyek Infura/Alchemy Anda
    ACCOUNT_ADDRESS: "0xYourWalletAddress", // Ganti dengan alamat dompet publik Anda

    // Alamat Kontrak Token
    USDC_CONTRACT_ADDRESS: "0x8BEbFCBe5468F146533C182dF3DFbF5ff9BE00E2",
    R2_CONTRACT_ADDRESS: "0xb816bB88f836EA75Ca4071B46FF285f690C43bb7",
    R2USD_CONTRACT_ADDRESS: "0x9e8FF356D35a2Da385C546d6Bf1D77ff85133365",
    SR2USD_CONTRACT_ADDRESS: "0x006CbF409CA275bA022111dB32BDAE054a97d488", // Token sR2USD

    WBTC_CONTRACT_ADDRESS: "0x4f5b54d4AF2568cefafA73bB062e5d734b55AA05", // Wrapped BTC di Sepolia
    R2WBTC_CONTRACT_ADDRESS: "0xDcb5C62EaC28d1eFc7132ad99F2Bd81973041D14", // R2Credential (R2WBTC) di Sepolia

    // Router Uniswap V2 Universal
    UNISWAP_V2_ROUTER_ADDRESS: "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3",
    UNISWAP_V2_ROUTER_ABI: [
        {"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"amountADesired","type":"uint256"},{"internalType":"uint256","name":"amountBDesired","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"nonpayable","type":"function"}
    ],

    // StableSwap Pool (sR2USD-R2USD)
    STABLE_SWAP_SR2USD_R2USD_POOL_ADDRESS: "0xe85A06C238439F981c90b2C91393b2F3c46e27FC",
    STABLE_SWAP_SR2USD_R2USD_POOL_ABI: [
        {"inputs":[{"internalType":"uint256[]","name":"_amounts","type":"uint256[]"},{"internalType":"uint256","name":"_min_mint_amount","type":"uint256"},{"internalType":"address","name":"_receiver","type":"address"}],"name":"add_liquidity","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"int128","name":"i","type":"int128"},{"internalType":"int128","name":"j","type":"int128"},{"internalType":"uint256","name":"_dx","type":"uint256"},{"internalType":"uint256","name":"_min_dy","type":"uint256"},{"internalType":"address","name":"_receiver","type":"address"}],"name":"exchange","outputs":[{"name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[],"name":"N_COINS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"arg0","type":"uint256"}],"name":"coins","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256[]","name":"_amounts","type":"uint256[]"},{"internalType":"bool","name":"_is_deposit","type":"bool"}],"name":"calc_token_amount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
    ],

    // Kontrak Staking WBTC (untuk mendapatkan R2WBTC)
    WBTC_R2WBTC_STAKING_CONTRACT_ADDRESS: "0x23b2615d783E16F14B62EfA125306c7c69B4941A",
    WBTC_R2WBTC_STAKING_ABI: [
        {"inputs":[{"internalType":"address","name":"_candidate","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"}
    ],

    // Kontrak Staking R2USD (untuk mendapatkan sR2USD)
    STAKING_R2USD_CONTRACT_ADDRESS: "0x006CbF409CA275bA022111dB32BDAE054a97d488",
    STAKING_R2USD_ABI: [
        {"name":"Transfer","inputs":[{"name":"sender","type":"address","indexed":true},{"name":"receiver","type":"address","indexed":true},{"name":"value","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},
        {"name":"Approval","inputs":[{"name":"owner","type":"address","indexed":true},{"name":"spender","type":"address","indexed":true},{"name":"value","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},
        {"name":"TokenExchange","inputs":[{"name":"buyer","type":"address","indexed":true},{"name":"sold_id","type":"int128","indexed":false},{"name":"tokens_sold","type":"uint256","indexed":false},{"name":"bought_id","type":"int128","indexed":false},{"name":"tokens_bought","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},
        {"name":"TokenExchangeUnderlying","inputs":[{"name":"buyer","type":"address","indexed":true},{"name":"sold_id","type":"int128","indexed":false},{"name":"tokens_sold","type":"uint256","indexed":false},{"name":"bought_id","type":"int128","indexed":false},{"name":"tokens_bought","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},
        {"name":"AddLiquidity","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_amounts","type":"uint256[]","indexed":false},{"name":"fees","type":"uint256[]","indexed":false},{"name":"invariant","type":"uint256","indexed":false},{"name":"token_supply","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},
        {"name":"RemoveLiquidity","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_amounts","type":"uint256[]","indexed":false},{"name":"fees","type":"uint256[]","indexed":false},{"name":"token_supply","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},
        {"name":"RemoveLiquidityOne","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_id","type":"int128","indexed":false},{"name":"token_amount","type":"uint256","indexed":false},{"name":"coin_amount","type":"uint256","indexed":false},{"name":"token_supply","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},
        {"name":"RemoveLiquidityImbalance","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_amounts","type":"uint256[]","indexed":false},{"name":"fees","type":"uint256[]","indexed":false},{"name":"invariant","type":"uint256","indexed":false},{"name":"token_supply","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},
        {"name":"RampA","inputs":[{"name":"old_A","type":"uint256","indexed":false},{"name":"new_A","type":"uint256","indexed":false},{"name":"initial_time","type":"uint256","indexed":false},{"name":"future_time","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"StopRampA","inputs":[{"name":"A","type":"uint256","indexed":false},{"name":"t","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},
        {"name":"ApplyNewFee","inputs":[{"name":"fee","type":"uint256","indexed":false},{"name":"offpeg_fee_multiplier","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},
        {"name":"SetNewMATime","inputs":[{"name":"ma_exp_time","type":"uint256","indexed":false},{"name":"D_ma_time","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},
        {"stateMutability":"nonpayable","type":"constructor","inputs":[{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_A","type":"uint256"},{"name":"_fee","type":"uint256"},{"name":"_offpeg_fee_multiplier","type":"uint256"},{"name":"_ma_exp_time","type":"uint256"},{"name":"_coins","type":"address[]"},{"name":"_rate_multipliers","type":"uint256[]"},{"name":"_asset_types","type":"uint8[]"},{"name":"_method_ids","type":"bytes4[]"},{"name":"_oracles","type":"address[]"}],"outputs":[]},
        {"stateMutability":"nonpayable","type":"function","name":"exchange","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"_dx","type":"uint256"},{"name":"_min_dy","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"nonpayable","type":"function","name":"exchange","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"_dx","type":"uint256"},{"name":"_min_dy","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"nonpayable","type":"function","name":"exchange_received","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"_dx","type":"uint256"},{"name":"_min_dy","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"nonpayable","type":"function","name":"exchange_received","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"_dx","type":"uint256"},{"name":"_min_dy","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"nonpayable","type":"function","name":"add_liquidity","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_min_mint_amount","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"nonpayable","type":"function","name":"add_liquidity","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_min_mint_amount","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"nonpayable","type":"function","name":"remove_liquidity_one_coin","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"i","type":"int128"},{"name":"_min_received","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"nonpayable","type":"function","name":"remove_liquidity_one_coin","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"i","type":"int128"},{"name":"_min_received","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"nonpayable","type":"function","name":"remove_liquidity_imbalance","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_max_burn_amount","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"nonpayable","type":"function","name":"remove_liquidity_imbalance","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_max_burn_amount","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"nonpayable","type":"function","name":"remove_liquidity","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"_min_amounts","type":"uint256[]"}],"outputs":[{"name":"","type":"uint256[]"}]},
        {"stateMutability":"nonpayable","type":"function","name":"remove_liquidity","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"_min_amounts","type":"uint256[]"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256[]"}]},
        {"stateMutability":"nonpayable","type":"function","name":"remove_liquidity","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"_min_amounts","type":"uint256[]"},{"name":"_receiver","type":"address"},{"name":"_claim_admin_fees","type":"bool"}],"outputs":[{"name":"","type":"uint256[]"}]},
        {"stateMutability":"nonpayable","type":"function","name":"withdraw_admin_fees","inputs":[],"outputs":[]},
        {"stateMutability":"view","type":"function","name":"last_price","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"ema_price","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"get_p","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"price_oracle","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"D_oracle","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"nonpayable","type":"function","name":"transfer","inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"outputs":[{"name":"","type":"bool"}]},
        {"stateMutability":"nonpayable","type":"function","name":"transferFrom","inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"outputs":[{"name":"","type":"bool"}]},
        {"stateMutability":"nonpayable","type":"function","name":"approve","inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"outputs":[{"name":"","type":"bool"}]},
        {"stateMutability":"nonpayable","type":"function","name":"permit","inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"},{"name":"_deadline","type":"uint256"},{"internalType":"uint8","name":"_v"},{"internalType":"bytes32","name":"_r"},{"internalType":"bytes32","name":"_s"}],"outputs":[{"name":"","type":"bool"}]},
        {"stateMutability":"view","type":"function","name":"DOMAIN_SEPARATOR","inputs":[],"outputs":[{"name":"","type":"bytes32"}]},
        {"stateMutability":"view","type":"function","name":"get_dx","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"dy","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"get_dy","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"dx","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"calc_withdraw_one_coin","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"i","type":"int128"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"totalSupply","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"get_virtual_price","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"calc_token_amount","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_is_deposit","type":"bool"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"A","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"A_precise","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"balances","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"get_balances","inputs":[],"outputs":[{"name":"","type":"uint256[]"}]},
        {"stateMutability":"view","type":"function","name":"stored_rates","inputs":[],"outputs":[{"name":"","type":"uint256[]"}]},
        {"stateMutability":"view","type":"function","name":"dynamic_fee","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"nonpayable","type":"function","name":"ramp_A","inputs":[{"name":"_future_A","type":"uint256"},{"name":"_future_time","type":"uint256"}],"outputs":[]},
        {"stateMutability":"nonpayable","type":"function","name":"stop_ramp_A","inputs":[],"outputs":[]},
        {"stateMutability":"nonpayable","type":"function","name":"set_new_fee","inputs":[{"name":"_new_fee","type":"uint256"},{"name":"_new_offpeg_fee_multiplier","type":"uint256"}],"outputs":[]},
        {"stateMutability":"nonpayable","type":"function","name":"set_ma_exp_time","inputs":[{"name":"_ma_exp_time","type":"uint256"},{"name":"_D_ma_time","type":"uint256"}],"outputs":[]},
        {"stateMutability":"view","type":"function","name":"N_COINS","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"coins","inputs":[{"name":"arg0","type":"uint256"}],"outputs":[{"name":"","type":"address"}]},
        {"stateMutability":"view","type":"function","name":"fee","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"offpeg_fee_multiplier","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"admin_fee","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"initial_A","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"future_A","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"initial_A_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"future_A_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"admin_balances","inputs":[{"name":"arg0","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"ma_exp_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"D_ma_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"ma_last_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"name","inputs":[],"outputs":[{"name":"","type":"string"}]},
        {"stateMutability":"view","type":"function","name":"symbol","inputs":[],"outputs":[{"name":"","type":"string"}]},
        {"stateMutability":"view","type":"function","name":"decimals","inputs":[],"outputs":[{"name":"","type":"uint8"}]},
        {"stateMutability":"view","type":"function","name":"version","inputs":[],"outputs":[{"name":"","type":"string"}]},
        {"stateMutability":"view","type":"function","name":"balanceOf","inputs":[{"name":"arg0","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"allowance","inputs":[{"name":"arg0","type":"address"},{"name":"arg1","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"nonces","inputs":[{"name":"arg0","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"salt","inputs":[],"outputs":[{"name":"","type":"bytes32"}]}
    ],

    // Kontrak Staking WBTC (untuk mendapatkan R2WBTC)
    WBTC_R2WBTC_STAKING_CONTRACT_ADDRESS: "0x23b2615d783E16F14B62EfA125306c7c69B4941A",
    WBTC_R2WBTC_STAKING_ABI: [
        {"inputs":[{"internalType":"address","name":"_candidate","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"}
    ],

    // Kontrak Staking R2USD (untuk mendapatkan sR2USD)
    STAKING_R2USD_CONTRACT_ADDRESS: "0x006CbF409CA275bA022111dB32BDAE054a97d488",
    STAKING_R2USD_ABI: [
        {"name":"Transfer","inputs":[{"name":"sender","type":"address","indexed":true},{"name":"receiver","type":"address","indexed":true},{"name":"value","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},
        {"name":"Approval","inputs":[{"name":"owner","type":"address","indexed":true},{"name":"spender","type":"address","indexed":true},{"name":"value","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},
        {"name":"TokenExchange","inputs":[{"name":"buyer","type":"address","indexed":true},{"name":"sold_id","type":"int128","indexed":false},{"name":"tokens_sold","type":"uint256","indexed":false},{"name":"bought_id","type":"int128","indexed":false},{"name":"tokens_bought","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},
        {"name":"TokenExchangeUnderlying","inputs":[{"name":"buyer","type":"address","indexed":true},{"name":"sold_id","type":"int128","indexed":false},{"name":"tokens_sold","type":"uint256","indexed":false},{"name":"bought_id","type":"int128","indexed":false},{"name":"tokens_bought","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},
        {"name":"AddLiquidity","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_amounts","type":"uint256[]","indexed":false},{"name":"fees","type":"uint256[]","indexed":false},{"name":"invariant","type":"uint256","indexed":false},{"name":"token_supply","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},
        {"name":"RemoveLiquidity","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_amounts","type":"uint256[]","indexed":false},{"name":"fees","type":"uint256[]","indexed":false},{"name":"token_supply","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},
        {"name":"RemoveLiquidityOne","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_id","type":"int128","indexed":false},{"name":"token_amount","type":"uint256","indexed":false},{"name":"coin_amount","type":"uint256","indexed":false},{"name":"token_supply","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},
        {"name":"RemoveLiquidityImbalance","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_amounts","type":"uint256[]","indexed":false},{"name":"fees","type":"uint256[]","indexed":false},{"name":"invariant","type":"uint256","indexed":false},{"name":"token_supply","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},
        {"name":"RampA","inputs":[{"name":"old_A","type":"uint256","indexed":false},{"name":"new_A","type":"uint256","indexed":false},{"name":"initial_time","type":"uint256","indexed":false},{"name":"future_time","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},
        {"name":"StopRampA","inputs":[{"name":"A","type":"uint256","indexed":false},{"name":"t","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},
        {"name":"ApplyNewFee","inputs":[{"name":"fee","type":"uint256","indexed":false},{"name":"offpeg_fee_multiplier","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},
        {"name":"SetNewMATime","inputs":[{"name":"ma_exp_time","type":"uint256","indexed":false},{"name":"D_ma_time","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},
        {"stateMutability":"nonpayable","type":"constructor","inputs":[{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_A","type":"uint256"},{"name":"_fee","type":"uint256"},{"name":"_offpeg_fee_multiplier","type":"uint256"},{"name":"_ma_exp_time","type":"uint256"},{"name":"_coins","type":"address[]"},{"name":"_rate_multipliers","type":"uint256[]"},{"name":"_asset_types","type":"uint8[]"},{"name":"_method_ids","type":"bytes4[]"},{"name":"_oracles","type":"address[]"}],"outputs":[]},
        {"stateMutability":"nonpayable","type":"function","name":"exchange","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"_dx","type":"uint256"},{"name":"_min_dy","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"nonpayable","type":"function","name":"exchange","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"_dx","type":"uint256"},{"name":"_min_dy","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"nonpayable","type":"function","name":"exchange_received","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"_dx","type":"uint256"},{"name":"_min_dy","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"nonpayable","type":"function","name":"exchange_received","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"_dx","type":"uint256"},{"name":"_min_dy","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"nonpayable","type":"function","name":"add_liquidity","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_min_mint_amount","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"nonpayable","type":"function","name":"add_liquidity","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_min_mint_amount","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"nonpayable","type":"function","name":"remove_liquidity_one_coin","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"i","type":"int128"},{"name":"_min_received","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"nonpayable","type":"function","name":"remove_liquidity_one_coin","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"i","type":"int128"},{"name":"_min_received","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"nonpayable","type":"function","name":"remove_liquidity_imbalance","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_max_burn_amount","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"nonpayable","type":"function","name":"remove_liquidity_imbalance","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_max_burn_amount","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"nonpayable","type":"function","name":"remove_liquidity","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"_min_amounts","type":"uint256[]"}],"outputs":[{"name":"","type":"uint256[]"}]},
        {"stateMutability":"nonpayable","type":"function","name":"remove_liquidity","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"_min_amounts","type":"uint256[]"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256[]"}]},
        {"stateMutability":"nonpayable","type":"function","name":"remove_liquidity","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"_min_amounts","type":"uint256[]"},{"name":"_receiver","type":"address"},{"name":"_claim_admin_fees","type":"bool"}],"outputs":[{"name":"","type":"uint256[]"}]},
        {"stateMutability":"nonpayable","type":"function","name":"withdraw_admin_fees","inputs":[],"outputs":[]},
        {"stateMutability":"view","type":"function","name":"last_price","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"ema_price","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"get_p","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"price_oracle","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"D_oracle","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"nonpayable","type":"function","name":"transfer","inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"outputs":[{"name":"","type":"bool"}]},
        {"stateMutability":"nonpayable","type":"function","name":"transferFrom","inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"outputs":[{"name":"","type":"bool"}]},
        {"stateMutability":"nonpayable","type":"function","name":"approve","inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"outputs":[{"name":"","type":"bool"}]},
        {"stateMutability":"nonpayable","type":"function","name":"permit","inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"},{"name":"_deadline","type":"uint256"},{"internalType":"uint8","name":"_v"},{"internalType":"bytes32","name":"_r"},{"internalType":"bytes32","name":"_s"}],"outputs":[{"name":"","type":"bool"}]},
        {"stateMutability":"view","type":"function","name":"DOMAIN_SEPARATOR","inputs":[],"outputs":[{"name":"","type":"bytes32"}]},
        {"stateMutability":"view","type":"function","name":"get_dx","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"dy","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"get_dy","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"dx","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"calc_withdraw_one_coin","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"i","type":"int128"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"totalSupply","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"get_virtual_price","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"calc_token_amount","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_is_deposit","type":"bool"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"A","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"A_precise","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"balances","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"get_balances","inputs":[],"outputs":[{"name":"","type":"uint256[]"}]},
        {"stateMutability":"view","type":"function","name":"stored_rates","inputs":[],"outputs":[{"name":"","type":"uint256[]"}]},
        {"stateMutability":"view","type":"function","name":"dynamic_fee","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"nonpayable","type":"function","name":"ramp_A","inputs":[{"name":"_future_A","type":"uint256"},{"name":"_future_time","type":"uint256"}],"outputs":[]},
        {"stateMutability":"nonpayable","type":"function","name":"stop_ramp_A","inputs":[],"outputs":[]},
        {"stateMutability":"nonpayable","type":"function","name":"set_new_fee","inputs":[{"name":"_new_fee","type":"uint256"},{"name":"_new_offpeg_fee_multiplier","type":"uint256"}],"outputs":[]},
        {"stateMutability":"nonpayable","type":"function","name":"set_ma_exp_time","inputs":[{"name":"_ma_exp_time","type":"uint256"},{"name":"_D_ma_time","type":"uint256"}],"outputs":[]},
        {"stateMutability":"view","type":"function","name":"N_COINS","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"coins","inputs":[{"name":"arg0","type":"uint256"}],"outputs":[{"name":"","type":"address"}]},
        {"stateMutability":"view","type":"function","name":"fee","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"offpeg_fee_multiplier","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"admin_fee","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"initial_A","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"future_A","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"initial_A_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"future_A_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"admin_balances","inputs":[{"name":"arg0","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"ma_exp_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"D_ma_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"ma_last_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"name","inputs":[],"outputs":[{"name":"","type":"string"}]},
        {"stateMutability":"view","type":"function","name":"symbol","inputs":[],"outputs":[{"name":"","type":"string"}]},
        {"stateMutability":"view","type":"function","name":"decimals","inputs":[],"outputs":[{"name":"","type":"uint8"}]},
        {"stateMutability":"view","type":"function","name":"version","inputs":[],"outputs":[{"name":"","type":"string"}]},
        {"stateMutability":"view","type":"function","name":"balanceOf","inputs":[{"name":"arg0","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"allowance","inputs":[{"name":"arg0","type":"address"},{"name":"arg1","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"nonces","inputs":[{"name":"arg0","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},
        {"stateMutability":"view","type":"function","name":"salt","inputs":[],"outputs":[{"name":"","type":"bytes32"}]},
        {"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"uint256","name":"_min_mint_amount","type":"uint256"}],"name":"deposit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"} // Fungsi deposit yang ditambahkan berdasarkan trace
    ]
};

// --- Inisialisasi Provider dan Wallet ---
// Provider mengambil URL RPC dari konfigurasi
const provider = new ethers.JsonRpcProvider(CONFIG.SEPOLIA_RPC_URL);
// Wallet mengambil Private Key dari variabel lingkungan (file .env)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// --- ABI ERC20 umum (untuk fungsi dasar ERC20 seperti decimals, symbol, approve) ---
const ERC20_ABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function balanceOf(address account) view returns (uint256)"
];

// --- Fungsi Helper ---

/**
 * Mendapatkan objek kontrak Ethers.js.
 * @param {string} address - Alamat kontrak.
 * @param {Array<object>} abi - ABI kontrak.
 * @returns {ethers.Contract} Objek kontrak yang terhubung dengan wallet.
 */
function getContract(address, abi) {
    return new ethers.Contract(address, abi, wallet);
}

/**
 * Menyetujui sejumlah token ERC20 agar dapat dihabiskan oleh spender.
 * @param {string} tokenAddress - Alamat token yang akan di-approve.
 * @param {string} spenderAddress - Alamat kontrak yang akan diizinkan.
 * @param {ethers.BigNumberish} amount - Jumlah token (dalam unit terkecil token) untuk di-approve.
 * @returns {Promise<boolean>} True jika approve berhasil atau sudah cukup, False jika gagal.
 */
async function approveToken(tokenAddress, spenderAddress, amount) {
    try {
        const tokenContract = getContract(tokenAddress, ERC20_ABI);
        const tokenSymbol = await tokenContract.symbol().catch(() => "Unknown Token");

        const currentAllowance = await tokenContract.allowance(CONFIG.ACCOUNT_ADDRESS, spenderAddress);

        console.log(`Current allowance of ${tokenSymbol} for ${spenderAddress}: ${currentAllowance.toString()}`);

        if (currentAllowance.gte(amount)) {
            console.log(`Allowance ${currentAllowance.toString()} is sufficient. No new approval for ${tokenSymbol} needed.`);
            return true;
        }

        console.log(`Approving ${amount.toString()} ${tokenSymbol} for ${spenderAddress}...`);
        const tx = await tokenContract.approve(spenderAddress, amount);
        await tx.wait(); // Tunggu hingga transaksi dikonfirmasi

        console.log(`Approval for ${tokenSymbol} successful! Tx Hash: ${tx.hash}`);
        return true;
    } catch (error) {
        console.error(`Error approving token ${tokenAddress} for ${spenderAddress}:`, error);
        return false;
    }
}

/**
 * Mendapatkan jumlah desimal dari token ERC20.
 * @param {string} tokenAddress - Alamat token.
 * @returns {Promise<number>} Jumlah desimal.
 */
async function getTokenDecimals(tokenAddress) {
    try {
        const tokenContract = getContract(tokenAddress, ERC20_ABI);
        const decimals = await tokenContract.decimals();
        return decimals;
    } catch (error) {
        console.error(`Error getting decimals for ${tokenAddress}:`, error);
        return 18; // Default ke 18 jika gagal
    }
}

/**
 * Mendapatkan timestamp Unix saat ini.
 * @returns {number} Timestamp Unix.
 */
function getCurrentTimestamp() {
    return Math.floor(Date.now() / 1000);
}

/**
 * Mendapatkan indeks token di dalam StableSwap-like pool menggunakan fungsi coins(i).
 * @param {string} poolContractAddress - Alamat pool.
 * @param {Array<object>} poolAbi - ABI pool.
 * @param {string} targetTokenAddress - Alamat token yang dicari.
 * @returns {Promise<number|null>} Indeks (int) atau null jika tidak ditemukan.
 */
async function getTokenIndexInStableSwapPool(poolContractAddress, poolAbi, targetTokenAddress) {
    try {
        const poolContract = getContract(poolContractAddress, poolAbi);
        // N_COINS mungkin tidak selalu ada atau mungkin gagal. Handle dengan catch.
        const numCoins = await poolContract.N_COINS().catch(() => { console.warn(`N_COINS not found for ${poolContractAddress}.`); return 0; }); 
        
        if (numCoins === 0) { // Jika N_COINS tidak ditemukan atau 0, coba cara lain jika perlu, atau abaikan
             console.log(`N_COINS not found or 0 for pool ${poolContractAddress}. Cannot determine token index.`);
            return null;
        }
        for (let i = 0; i < numCoins; i++) {
            const coinAddress = await poolContract.coins(i);
            if (coinAddress.toLowerCase() === targetTokenAddress.toLowerCase()) {
                const tokenSymbol = await getContract(targetTokenAddress, ERC20_ABI).symbol().catch(() => "Unknown Token");
                console.log(`Found ${tokenSymbol} at index ${i} in ${poolContractAddress}`);
                return i;
            }
        }
        console.log(`Token ${targetTokenAddress} not found in pool ${poolContractAddress}.`);
        return null;
    } catch (error) {
        console.error(`Error getting token index in pool ${poolContractAddress}:`, error);
        return null;
    }
}


// --- Fungsi Swap Token-ke-Token Universal (Uniswap V2) ---
/**
 * Melakukan swap dari token_in ke token_out menggunakan router Uniswap V2-like.
 * @param {string} tokenInAddress - Alamat token yang akan di-swap masuk.
 * @param {string} tokenOutAddress - Alamat token yang diharapkan keluar.
 * @param {ethers.BigNumberish} amountIn - Jumlah token_in yang akan di-swap (dalam unit terkecil).
 * @param {string} recipientAddress - Alamat yang akan menerima token_out.
 * @param {string} routerAddress - Alamat Uniswap V2 Router.
 * @param {Array<object>} routerAbi - ABI Uniswap V2 Router.
 * @param {number} slippageTolerance - Toleransi slippage (contoh: 0.99 untuk 1% slippage).
 */
async function swapTokensUniswap(
    tokenInAddress,
    tokenOutAddress,
    amountIn,
    recipientAddress,
    routerAddress,
    routerAbi,
    slippageTolerance = 0.99
) {
    const routerContract = getContract(routerAddress, routerAbi);

    const tokenInSymbol = await getContract(tokenInAddress, ERC20_ABI).symbol().catch(() => "Unknown");
    const tokenOutSymbol = await getContract(tokenOutAddress, ERC20_ABI).symbol().catch(() => "Unknown");

    console.log(`Attempting to swap ${ethers.formatUnits(amountIn, await getTokenDecimals(tokenInAddress))} ${tokenInSymbol} to ${tokenOutSymbol} via Uniswap V2 Router ${routerAddress}...`);

    // Step 1: Approve token_in for the Router Contract
    if (!(await approveToken(tokenInAddress, routerAddress, amountIn))) {
        console.log(`Failed to approve ${tokenInSymbol} for the router contract.`);
        return;
    }

    // Step 2: Calculate minAmountOut dynamically
    let finalMinAmountOut = ethers.toBigInt(0); 
    try {
        const path = [tokenInAddress, tokenOutAddress];
        const amountsOut = await routerContract.getAmountsOut(amountIn, path);
        const expectedAmountOut = amountsOut[1];

        const calculatedMinAmountOut = expectedAmountOut.mul(ethers.toBigInt(Math.floor(slippageTolerance * 10000))).div(ethers.toBigInt(10000));
        finalMinAmountOut = calculatedMinAmountOut;

        console.log(`Expected ${tokenOutSymbol} out: ${ethers.formatUnits(expectedAmountOut, await getTokenDecimals(tokenOutAddress))}. Calculated min ${tokenOutSymbol} out (with ${100 - (slippageTolerance * 100)}% slippage): ${ethers.formatUnits(finalMinAmountOut, await getTokenDecimals(tokenOutAddress))}`);
    } catch (error) {
        console.warn(`Warning: Could not get dynamic minAmountOut for ${tokenInSymbol} to ${tokenOutSymbol}:`, error.message, `. Using default min amount (0). This is risky for live trades!`);
    }

    const deadline = getCurrentTimestamp() + (60 * 20); // 20 minutes from now

    try {
        const tx = await routerContract.swapExactTokensForTokens(
            amountIn,
            finalMinAmountOut,
            [tokenInAddress, tokenOutAddress], // Swap path
            recipientAddress,
            deadline
        );

        console.log(`Swap transaction sent. Tx Hash: ${tx.hash}`);
        const receipt = await tx.wait();

        if (receipt.status === 1) {
            console.log(`Swap successful! Confirmed in block: ${receipt.blockNumber}`);
        } else {
            console.log(`Swap failed:`, receipt);
        }
    } catch (error) {
        console.error(`Error during ${tokenInSymbol} to ${tokenOutSymbol} swap:`, error);
    }
}


// --- Fungsi Add Liquidity di Uniswap V2-like ---
/**
 * Menambahkan likuiditas ke pair tokenA/tokenB menggunakan router Uniswap V2-like.
 * @param {string} tokenAAddress - Alamat token A.
 * @param {string} tokenBAddress - Alamat token B.
 * @param {ethers.BigNumberish} amountADesired - Jumlah token A yang diinginkan.
 * @param {ethers.BigNumberish} amountBDesired - Jumlah token B yang diinginkan.
 * @param {string} routerAddress - Alamat Uniswap V2 Router.
 * @param {Array<object>} routerAbi - ABI Uniswap V2 Router.
 * @param {number} slippageTolerance - Toleransi slippage.
 */
async function addLiquidityUniswap(
    tokenAAddress,
    tokenBAddress,
    amountADesired,
    amountBDesired,
    routerAddress,
    routerAbi,
    slippageTolerance = 0.99
) {
    const routerContract = getContract(routerAddress, routerAbi);

    const tokenASymbol = await getContract(tokenAAddress, ERC20_ABI).symbol().catch(() => "Unknown");
    const tokenBSymbol = await getContract(tokenBAddress, ERC20_ABI).symbol().catch(() => "Unknown");

    console.log(`Adding liquidity for pair ${tokenASymbol}/${tokenBSymbol} via Uniswap V2 Router ${routerAddress}...`);

    // Approve token A dan B untuk Router
    if (!(await approveToken(tokenAAddress, routerAddress, amountADesired))) {
        console.log(`Failed to approve ${tokenASymbol} for add liquidity.`);
        return;
    }
    if (!(await approveToken(tokenBAddress, routerAddress, amountBDesired))) {
        console.log(`Failed to approve ${tokenBSymbol} for add liquidity.`);
        return;
    }

    const deadline = getCurrentTimestamp() + (60 * 20); // 20 minutes from now

    // Hitung amountAMin dan amountBMin berdasarkan slippage
    const amountAMin = amountADesired.mul(ethers.toBigInt(Math.floor(slippageTolerance * 10000))).div(ethers.toBigInt(10000));
    const amountBMin = amountBDesired.mul(ethers.toBigInt(Math.floor(slippageTolerance * 10000))).div(ethers.toBigInt(10000));

    try {
        const tx = await routerContract.addLiquidity(
            tokenAAddress,
            tokenBAddress,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin,
            CONFIG.ACCOUNT_ADDRESS,
            deadline
        );

        console.log(`Add liquidity transaction sent. Tx Hash: ${tx.hash}`);
        const receipt = await tx.wait();

        if (receipt.status === 1) {
            console.log(`Add liquidity successful! Confirmed in block: ${receipt.blockNumber}`);
        } else {
            console.log(`Add liquidity failed:`, receipt);
        }
    } catch (error) {
        console.error(`Error adding liquidity for ${tokenASymbol}/${tokenBSymbol}:`, error);
    }
}


// --- Fungsi Add Liquidity di StableSwap Pool (sR2USD-R2USD Pool) ---
/**
 * Menambahkan likuiditas ke StableSwap Pool (sR2USD-R2USD Pool).
 * @param {object} tokenAmountsDict - Dictionary {token_address: amount} untuk token yang akan ditambahkan.
 * Harus mencakup semua token di pool, dengan 0 untuk yang tidak ditambahkan.
 * @param {ethers.BigNumberish} minMintAmount - Jumlah minimum LP token yang diharapkan akan dicetak.
 * @param {string} recipientAddress - Alamat yang akan menerima LP token.
 * @param {string} poolAddress - Alamat StableSwap Pool.
 * @param {Array<object>} poolAbi - ABI StableSwap Pool.
 * @param {number} slippageTolerance - Toleransi slippage.
 */
async function addLiquidityStableSwap(
    tokenAmountsDict,
    minMintAmount,
    recipientAddress,
    poolAddress,
    poolAbi,
    slippageTolerance = 0.99
) {
    const poolContract = getContract(poolAddress, poolAbi);

    // Dapatkan alamat token di pool dan urutkan sesuai indeks
    const poolCoins = [];
    try {
        const numCoins = await poolContract.N_COINS(); 
        for (let i = 0; i < numCoins; i++) {
            poolCoins.push(await poolContract.coins(i));
        }
    } catch (error) {
        console.error(`Error getting coins from StableSwap Pool:`, error, `. Cannot add liquidity.`);
        return;
    }

    const amounts = [];
    for (const coinAddress of poolCoins) {
        const amountForCoin = tokenAmountsDict[coinAddress] || ethers.toBigInt(0);
        amounts.push(amountForCoin);

        // Approve setiap token yang akan disumbangkan ke pool
        if (amountForCoin.gt(0)) {
            if (!(await approveToken(coinAddress, poolAddress, amountForCoin))) {
                console.log(`Failed to approve ${await getContract(coinAddress, ERC20_ABI).symbol().catch(() => "Unknown")} for StableSwap Pool.`);
                return;
            }
        }
    }

    console.log(`Adding liquidity to StableSwap Pool ${poolAddress} with amounts: ${amounts.map(a => a.toString())}...`);

    // Perkirakan jumlah LP token yang akan dicetak
    let finalMinMintAmount = ethers.toBigInt(0);
    try {
        const expectedLPTokens = await poolContract.calc_token_amount(amounts, true);
        finalMinMintAmount = expectedLPTokens.mul(ethers.toBigInt(Math.floor(slippageTolerance * 10000))).div(ethers.toBigInt(10000));
        console.log(`Expected LP tokens: ${ethers.formatUnits(expectedLPTokens, await getTokenDecimals(poolAddress))}. Calculated min LP tokens (with ${100 - (slippageTolerance * 100)}% slippage): ${ethers.formatUnits(finalMinMintAmount, await getTokenDecimals(poolAddress))}`);
    } catch (error) {
        console.warn(`Warning: Could not get dynamic min_mint_amount from StableSwap Pool:`, error.message, `. Using provided minMintAmount: ${minMintAmount.toString()}. Risky!`);
        finalMinMintAmount = minMintAmount;
    }

    try {
        const tx = await poolContract.add_liquidity(
            amounts,
            finalMinMintAmount,
            recipientAddress
        );

        console.log(`Add liquidity to StableSwap Pool transaction sent. Tx Hash: ${tx.hash}`);
        const receipt = await tx.wait();

        if (receipt.status === 1) {
            console.log(`Add liquidity to StableSwap Pool successful! Confirmed in block: ${receipt.blockNumber}`);
        } else {
            console.log(`Add liquidity to StableSwap Pool failed:`, receipt);
        }
    } catch (error) {
        console.error(`Error adding liquidity to StableSwap Pool:`, error);
    }
}


// --- Fungsi Staking R2USD untuk mendapatkan sR2USD ---
/**
 * Melakukan staking R2USD ke kontrak staking untuk mendapatkan sR2USD.
 * Menggunakan fungsi `deposit(uint256 _amount, uint256 _min_mint_amount)`.
 * @param {ethers.BigNumberish} amountR2USDToStake - Jumlah R2USD yang akan di-stake (dalam unit terkecil token).
 * @param {string} recipientAddress - Alamat yang akan menerima sR2USD.
 */
async function stakeR2USDToSR2USD(amountR2USDToStake, recipientAddress) {
    const stakingContract = getContract(CONFIG.STAKING_R2USD_CONTRACT_ADDRESS, CONFIG.STAKING_R2USD_ABI);

    console.log(`Staking ${ethers.formatUnits(amountR2USDToStake, await getTokenDecimals(CONFIG.R2USD_CONTRACT_ADDRESS))} R2USD to get sR2USD via ${CONFIG.STAKING_R2USD_CONTRACT_ADDRESS}...`);

    // Step 1: Approve R2USD for the Staking Contract
    if (!(await approveToken(CONFIG.R2USD_CONTRACT_ADDRESS, CONFIG.STAKING_R2USD_CONTRACT_ADDRESS, amountR2USDToStake))) {
        console.log("Failed to approve R2USD for the staking contract.");
        return;
    }

    // Step 2: Lakukan transaksi staking
    let minSR2USDOut = ethers.toBigInt(0); 
    const slippageTolerance = 0.99;

    try {
        // Asumsi: Kontrak staking ini adalah StableSwap-like pool dan menggunakan calc_token_amount
        const numCoinsInStakingPool = await stakingContract.N_COINS().catch(() => 0); // Pastikan N_COINS ada
        const dummyAmounts = new Array(Number(numCoinsInStakingPool)).fill(ethers.toBigInt(0));
        
        const r2usdIndexInStakingPool = await getTokenIndexInStableSwapPool(CONFIG.STAKING_R2USD_CONTRACT_ADDRESS, CONFIG.STAKING_R2USD_ABI, CONFIG.R2USD_CONTRACT_ADDRESS);
        
        if (r2usdIndexInStakingPool === null) {
            throw new Error("R2USD token not found in the staking contract's pool of coins. Please verify setup or hardcode index if confident.");
        }

        dummyAmounts[r2usdIndexInStakingPool] = amountR2USDToStake;
        
        const expectedSR2USDMinted = await stakingContract.calc_token_amount(dummyAmounts, true);
        minSR2USDOut = expectedSR2USDMinted.mul(ethers.toBigInt(Math.floor(slippageTolerance * 10000))).div(ethers.toBigInt(10000));
        console.log(`Expected sR2USD minted: ${ethers.formatUnits(expectedSR2USDMinted, await getTokenDecimals(CONFIG.SR2USD_CONTRACT_ADDRESS))}. Calculated min sR2USD out: ${ethers.formatUnits(minSR2USDOut, await getTokenDecimals(CONFIG.SR2USD_CONTRACT_ADDRESS))}`);

        // Panggil fungsi `deposit` (sesuai deduksi dari trace)
        const tx = await stakingContract.deposit(
            amountR2USDToStake,
            minSR2USDOut
        );

        console.log(`Staking transaction sent. Tx Hash: ${tx.hash}`);
        const receipt = await tx.wait();

        if (receipt.status === 1) {
            console.log(`R2USD staking successful, sR2USD received! Confirmed in block: ${receipt.blockNumber}`);
        } else {
            console.log(`R2USD staking failed:`, receipt);
        }
    } catch (error) {
        console.error(`Error during R2USD staking:`, error);
        console.error("Please ensure the ABI for STAKING_R2USD_CONTRACT_ADDRESS correctly includes 'deposit(uint256,uint256)' and check token indices.");
    }
}

// --- Fungsi Staking WBTC untuk mendapatkan R2WBTC ---
/**
 * Melakukan staking WBTC ke kontrak staking untuk mendapatkan R2WBTC.
 * Menggunakan fungsi `stake(address _candidate, uint256 _amount)`.
 * @param {ethers.BigNumberish} amountWBTCToStake - Jumlah WBTC yang akan di-stake (dalam unit terkecil token).
 * @param {string} candidateAddress - Alamat candidate yang akan di-stake (dari trace transaksi).
 * @param {string} recipientAddress - Alamat yang akan menerima R2WBTC (biasanya diri sendiri).
 */
async function stakeWBTCtoR2WBTC(amountWBTCToStake, candidateAddress, recipientAddress) {
    const stakingContract = getContract(CONFIG.WBTC_R2WBTC_STAKING_CONTRACT_ADDRESS, CONFIG.WBTC_R2WBTC_STAKING_ABI);

    console.log(`Staking ${ethers.formatUnits(amountWBTCToStake, await getTokenDecimals(CONFIG.WBTC_CONTRACT_ADDRESS))} WBTC to get R2WBTC via ${CONFIG.WBTC_R2WBTC_STAKING_CONTRACT_ADDRESS}...`);

    // Step 1: Approve WBTC for the Staking Contract
    if (!(await approveToken(CONFIG.WBTC_CONTRACT_ADDRESS, CONFIG.WBTC_R2WBTC_STAKING_CONTRACT_ADDRESS, amountWBTCToStake))) {
        console.log("Failed to approve WBTC for the staking contract.");
        return;
    }

    // Step 2: Lakukan transaksi staking
    try {
        const tx = await stakingContract.stake(
            candidateAddress,
            amountWBTCToStake
        );

        console.log(`WBTC staking transaction sent. Tx Hash: ${tx.hash}`);
        const receipt = await tx.wait();

        if (receipt.status === 1) {
            console.log(`WBTC staking successful, R2WBTC received! Confirmed in block: ${receipt.blockNumber}`);
        } else {
            console.log(`WBTC staking failed:`, receipt);
        }
    } catch (error) {
        console.error(`Error during WBTC staking:`, error);
        console.error("Please ensure the ABI for WBTC_R2WBTC_STAKING_CONTRACT_ADDRESS correctly includes 'stake(address,uint256)'.");
    }
}


// --- Fungsi Utama untuk Menjalankan Operasi DeFi ---
async function main() {
    console.log(`Current time is ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })}.`);
    console.log("Current location: Tangerang, Banten, Indonesia.");

    // --- Mendapatkan Desimal Token (dilakukan sekali di awal) ---
    const USDC_DECIMALS = await getTokenDecimals(CONFIG.USDC_CONTRACT_ADDRESS);
    const R2_DECIMALS = await getTokenDecimals(CONFIG.R2_CONTRACT_ADDRESS);
    const R2USD_DECIMALS = await getTokenDecimals(CONFIG.R2USD_CONTRACT_ADDRESS);
    const SR2USD_DECIMALS = await getTokenDecimals(CONFIG.SR2USD_CONTRACT_ADDRESS); 
    const WBTC_DECIMALS = await getTokenDecimals(CONFIG.WBTC_CONTRACT_ADDRESS); 
    const R2WBTC_DECIMALS = await getTokenDecimals(CONFIG.R2WBTC_CONTRACT_ADDRESS); 

    // --- Parameter Umum ---
    const SWAP_RECIPIENT_ADDRESS = CONFIG.ACCOUNT_ADDRESS;
    const SLIPPAGE_TOLERANCE = 0.99; // 1% slippage tolerance


    console.log("\n--- Starting DeFi Automation Operations ---");

    // --- Contoh Operasi Swap (Uniswap V2 Router) ---
    // Pastikan Anda memiliki saldo token yang cukup untuk operasi ini.
    // Uncomment baris di bawah untuk mengaktifkan operasi.

    // console.log("\n[Operation: Swap R2 to USDC (via Uniswap)]");
    // const amountR2In = ethers.parseUnits("1", R2_DECIMALS); // Swap 1 R2
    // await swapTokensUniswap(
    //     CONFIG.R2_CONTRACT_ADDRESS,
    //     CONFIG.USDC_CONTRACT_ADDRESS,
    //     amountR2In,
    //     SWAP_RECIPIENT_ADDRESS,
    //     CONFIG.UNISWAP_V2_ROUTER_ADDRESS,
    //     CONFIG.UNISWAP_V2_ROUTER_ABI,
    //     SLIPPAGE_TOLERANCE
    // );
    
    // console.log("\n[Operation: Swap R2USD to R2 (via Uniswap)]");
    // const amountR2USDIn = ethers.parseUnits("1", R2USD_DECIMALS); // Swap 1 R2USD
    // await swapTokensUniswap(
    //     CONFIG.R2USD_CONTRACT_ADDRESS,
    //     CONFIG.R2_CONTRACT_ADDRESS,
    //     amountR2USDIn,
    //     SWAP_RECIPIENT_ADDRESS,
    //     CONFIG.UNISWAP_V2_ROUTER_ADDRESS,
    //     CONFIG.UNISWAP_V2_ROUTER_ABI,
    //     SLIPPAGE_TOLERANCE
    // );


    // --- Operasi Add Liquidity: sR2USD-R2USD StableSwap Pool ---
    // Pastikan Anda memiliki saldo sR2USD dan R2USD yang cukup.
    console.log("\n[Operation: Add Liquidity sR2USD-R2USD StableSwap Pool]");
    // Anda harus mengetahui indeks token sR2USD dan R2USD di pool ini.
    // Fungsi `getTokenIndexInStableSwapPool` akan mencoba menemukannya secara dinamis.
    const sr2usd_pool_idx = await getTokenIndexInStableSwapPool(CONFIG.STABLE_SWAP_SR2USD_R2USD_POOL_ADDRESS, CONFIG.STABLE_SWAP_SR2USD_R2USD_POOL_ABI, CONFIG.SR2USD_CONTRACT_ADDRESS);
    const r2usd_pool_idx = await getTokenIndexInStableSwapPool(CONFIG.STABLE_SWAP_SR2USD_R2USD_POOL_ADDRESS, CONFIG.STABLE_SWAP_SR2USD_R2USD_POOL_ABI, CONFIG.R2USD_CONTRACT_ADDRESS);

    if (sr2usd_pool_idx === null || r2usd_pool_idx === null) {
        console.error("Failed to find sR2USD or R2USD index in StableSwap pool. Skipping Add Liquidity.");
    } else {
        const amountsForStableLP = {};
        amountsForStableLP[CONFIG.SR2USD_CONTRACT_ADDRESS] = ethers.parseUnits("0.999873", SR2USD_DECIMALS); // Example amount from your transaction
        amountsForStableLP[CONFIG.R2USD_CONTRACT_ADDRESS] = ethers.parseUnits("1", R2USD_DECIMALS); // Example amount from your transaction
        
        // Untuk minLPTokensExpectedStable, Anda bisa pakai estimasi dari transaksi atau 0 untuk risiko tinggi.
        // Sebaiknya biarkan otomatis dihitung dengan slippage.
        const minLPTokensExpectedStable = ethers.parseUnits("1.99987299591178389", 18); // Contoh dari transaksi, asumsikan LP token 18 desimal
        
        await addLiquidityStableSwap(
            amountsForStableLP, 
            minLPTokensExpectedStable, 
            SWAP_RECIPIENT_ADDRESS, 
            CONFIG.STABLE_SWAP_SR2USD_R2USD_POOL_ADDRESS, 
            CONFIG.STABLE_SWAP_SR2USD_R2USD_POOL_ABI, 
            SLIPPAGE_TOLERANCE
        );
    }

    // --- Operasi Staking: R2USD ke sR2USD ---
    // Pastikan Anda memiliki saldo R2USD yang cukup.
    console.log("\n[Operation: Stake R2USD to get sR2USD]");
    const amountR2USDToStake = ethers.parseUnits("1", R2USD_DECIMALS); // Stake 1 R2USD (sesuai transaksi)
    await stakeR2USDToSR2USD(amountR2USDToStake, SWAP_RECIPIENT_ADDRESS);

    // --- Operasi Staking: WBTC ke R2WBTC ---
    // Pastikan Anda memiliki saldo WBTC yang cukup.
    console.log("\n[Operation: Stake WBTC to get R2WBTC]");
    const amountWBTCToStake = ethers.parseUnits("0.005", WBTC_DECIMALS); // Stake 0.005 WBTC
    // `_candidate` adalah alamat token WBTC itu sendiri dalam kasus staking ini.
    const candidateAddressForWBTC = CONFIG.WBTC_CONTRACT_ADDRESS; 
    await stakeWBTCtoR2WBTC(amountWBTCToStake, candidateAddressForWBTC, SWAP_RECIPIENT_ADDRESS);


    console.log("\n--- DeFi Operations Finished ---");
}

// Jalankan fungsi utama
main().catch(error => {
    console.error("An error occurred in main execution:", error);
    process.exit(1);
});
