const midtransClient = require('midtrans-client');

// Tetap dipakai untuk mengecek status pembayaran (fungsi nomor 2)
const coreApi = new midtransClient.CoreApi({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});

// Ditambahkan untuk membuat transaksi QRIS via Snap (pengganti coreApi.charge)
const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});

// 1. Generate QRIS (Menggunakan Snap agar tidak kena 403 Access Denied di Sandbox)
exports.createQris = async (req, res) => {
    try {
        const { orderId, grossAmount } = req.body;

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: grossAmount
            },
            enabled_payments: ['gopay', 'qris', 'shopeepay'],
            custom_expiry: {
                expiry_duration: 15,
                unit: 'minute'
            }
        };

        const transaction = await snap.createTransaction(parameter);

        res.status(200).json({
            status: 'success',
            orderId: orderId,
            token: transaction.token,
            redirect_url: transaction.redirect_url
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// 2. Cek Status Pembayaran (Tetap dipertahankan seperti semula)
exports.checkStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const statusResponse = await coreApi.transaction.status(orderId);
        const transactionStatus = statusResponse.transaction_status;

        if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
            return res.status(200).json({ status: 'LUNAS', data: statusResponse });
        } else {
            return res.status(200).json({ status: transactionStatus.toUpperCase(), data: statusResponse });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};