<?php

namespace App\Http\Controllers\Api\Callback\PayinCallback;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Report;

class PayinCallbackController extends Controller
{
    /**
     * Send callback to merchant.
     */
     private function payinLog($message, $data = []){
         
         $log_path = storage_path('callback/payin');
         
         if(!file_exists($log_path)){
             mkdir($log_path, 0777,true);
         }
         $file = $log_path . '/' . date('Y-m-d') . 'log';
         
         $text = ' [ '. date('Y-m-d H:i:s') . ' ] '. " : " . $message;
         
         if(!empty($data)){
             $text .= " " .json_encode($data);
         }
         $text .= "\n\n";
         file_put_contents($file, $text, FILE_APPEND);
         
         
     }
     private function payoutLog($message, $data = [])
            {
                $logPath = storage_path('callback/payout');
            
                // Create directory if not exists
                if (!file_exists($logPath)) {
                    mkdir($logPath, 0777, true);
                }
            
                // File name by date
                $file = $logPath . '/' . date('Y-m-d') . '.log';
            
                // Format log
                $text = "[" . date('Y-m-d H:i:s') . "] " . $message;
                if (!empty($data)) {
                    $text .= " " . json_encode($data);
                }
                $text .= "\n";
            
                file_put_contents($file, $text, FILE_APPEND);
            }
     
    public function merchantCallBackResponse($callbackurl, $status, $txnid, $mytxnid, $amount, $referenceId, $timestamp)
    {
        $this->payinLog("Callback function called", [
            'callbackurl' => $callbackurl,
            'status' => $status,
            'txnid' => $txnid,
            'clienttxnid' => $mytxnid,
            'amount' => $amount,
            'UTR' => $referenceId,
            'timestamp' => $timestamp,
        ]);

        $postData = [
            'status' => $status,
            'txnid' => $txnid,
            'clienttxnid' => $mytxnid,
            'amount' => $amount,
            'UTR' => $referenceId,
            'timestamp' => $timestamp,
        ];

        $ch = curl_init($callbackurl);

        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($postData),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_USERAGENT => 'SpayWebhookBot/1.0',
            CURLOPT_TIMEOUT => 300,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Accept: application/json',
            ],
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if (curl_errno($ch)) {
            $error = curl_error($ch);
            Log::error("Callback Error: $error", [
                'callbackurl' => $callbackurl,
                'data' => $postData
            ]);
        } else {
            $this->payinLog("Callback sent", [
                'url' => $callbackurl,
                'data' => $postData,
                'http_code' => $httpCode,
                'response' => $response
            ]);
        }

        curl_close($ch);
    }

    /**
     * Handle Airpay callback.
     */
    public function airpaycallbkp(Request $request)
    {
        // dd("hello");
        $this->payinLog('Airpay Callback Received', [
            'request_array' => $request->all(),
            'raw_content' => $request->getContent()
        ]);

        // Store raw request for debugging
        DB::table('micro_logs')->insert([
            'product_response' => json_encode($request->all()),
            'product_name' => 'Airpay',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $data = json_decode($request->getContent(), true);
        // $data = json_decode($request->input('response'), true);
        if (!$data) {
            $this->payinLog('Failed to decode Airpay response', ['input' => $request->getContent()]);
            return response()->json(['status' => false, 'message' => 'Invalid response']);
        }

        $payid = $data['decodedResponse']['data']['orderid'] ?? null;
        $airpayStatus = $data['decodedResponse']['data']['transaction_payment_status'] ?? null;
        $timestamp = $data['timestamp'] ?? null;

        if (!$payid) {
            $this->payinLog('payid missing in Airpay response', ['response' => $data]);
            return response()->json(['status' => false, 'message' => 'Order ID missing']);
        }

        $report = Report::where('mytxnid', $payid)
            ->where('status', 'initiated')
            ->where('product', 'UPI')
            ->first();

        if (!$report) {
            $this->payinLog('No report found for payid', ['payid' => $payid]);
            return response()->json(['status' => false, 'message' => 'Report not found']);
        }

        $user = User::find($report->user_id);
        $refno = $data['decodedResponse']['data']['rrn'] ?? null;

        // Prepare report update
        $updateOrder = [
            'option2' => $data['decodedResponse']['data']['charge_type'] ?? null,
            'option3' => $data['decodedResponse']['data']['ap_securehash'] ?? null,
        ];

        // Override reason if failed
        if ($airpayStatus === 'FAILED') {
            $updateOrder['option2'] = $data['decodedResponse']['data']['reason'] ?? null;
        }

        if ($refno) {
            $updateOrder['refno'] = $refno;
        }

        $updateOrder['status'] = $airpayStatus === 'SUCCESS' ? 'success' : ($airpayStatus === 'FAILED' ? 'failed' : $report->status);

        $report->update($updateOrder);

        $this->payinLog("Report updated", [
            'report_id' => $report->id,
            'update' => $updateOrder
        ]);

        // Trigger merchant callback if configured and valid
        if ($user->payin_callback) {
            $this->payinLog('Calling merchant callback', [
                'callbackurl' => $user->payin_callback,
                'status' => $airpayStatus,
                'txnid' => $report->txnid,
                'mytxnid' => $report->mytxnid,
                'amount' => $report->amount,
                'refno' => $refno,
                'timestamp' => $timestamp
            ]);

            $this->merchantCallBackResponse(
                $user->payin_callback,
                $airpayStatus,
                $report->txnid,
                $report->mytxnid,
                $report->amount,
                $refno,
                $timestamp
            );
        }

        $this->payinLog('Airpay callback processing finished');

        return response()->json(['status' => true, 'message' => 'AIRPAY Ready to work']);
    }
    
    public function nxtcallbkp(Request $request)
    {
    Log::info('NXT Callback Received');

    // Store raw callback
    DB::table('micro_logs')->insert([
        'product_response' => $request->getContent(),
        'product_name'     => 'NXT',
        'created_at'       => now(),
        'updated_at'       => now(),
    ]);

    $data = json_decode($request->getContent(), true);

    if (!$data || !isset($data['data']['service'])) {
        $this->payinLog('Invalid NXT callback payload', ['payload' => $request->getContent()]);
        return response()->json(['status' => false, 'message' => 'Invalid payload']);
    }

    $service = $data['data']['service'];

        if ($service === 'collection') {
            return $this->handleNxtPayin($data, $request);
        } elseif ($service === 'payout') {
            return $this->handleNxtPayout($data, $request);
        }
        
        return response()->json([
            'status'  => false,
            'message' => 'Unknown service'
        ]);

}

    private function handleNxtPayin(array $data, Request $request)
    {
        $this->payinLog('NXT Payin Callback Received', [
            'request_array' => $request->all(),
            'raw_content'   => $request->getContent()
        ]);
    
        $payid     = $data['data']['reference_id'] ?? null;
        $status    = strtolower($data['data']['status'] ?? '');
        $timestamp = $data['data']['updated_at'] ?? now();
        $refno     = $data['data']['utr'] ?? null;
    
        if (!$payid) {
            $this->payinLog('Payin reference_id missing', ['data' => $data]);
            return response()->json(['status' => false, 'message' => 'reference_id missing']);
        }
    
        $report = Report::where([
            ['mytxnid', $payid],
            ['status', 'initiated'],
            ['product', 'UPI']
        ])->first();
    
        if (!$report) {
            $this->payinLog('Payin report not found', ['payid' => $payid]);
            return response()->json(['status' => false, 'message' => 'Report not found']);
        }
    
        $update = [
            'option2' => $data['data']['upi_transaction_id'] ?? null,
            'option3' => $data['data']['report_id'] ?? null,
            'refno'   => $refno,
            'status'  => $status === 'paid' ? 'success' : ($status === 'failed' ? 'failed' : $report->status)
        ];

        $report->update($update);
    
        $this->payinLog('Payin Report Updated', [
            'report_id' => $report->id,
            'update'    => $update
        ]);
    
        $user = User::find($report->user_id);
    
        if ($user && $user->payin_callback) {
            $this->merchantCallBackResponse(
                $user->payin_callback,
                $status,
                $report->txnid,
                $report->mytxnid,
                $report->amount,
                $refno,
                $timestamp
            );
        }
    
        return response()->json(['status' => true, 'message' => 'Payin callback processed']);
    }

    private function handleNxtPayout(array $data, Request $request)
    {
        $this->payoutLog('NXT Payout Callback Received', [
            'request_array' => $request->all(),
            'raw_content'   => $request->getContent()
        ]);
    
        $payid     = $data['data']['transaction_id'] ?? null;
        $status    = strtolower($data['data']['status'] ?? '');
        $timestamp = $data['data']['updated_at'] ?? now();
        $refno     = $data['data']['utr'] ?? null;
    
        if (!$payid) {
            $this->payoutLog('Payout transaction_id missing', ['data' => $data]);
            return response()->json(['status' => false, 'message' => 'transaction_id missing']);
        }
    
        $report = Report::where([
            ['mytxnid', $payid],
            ['status', 'pending'],
            ['product', 'payout']
        ])->first();
    
        if (!$report) {
            $this->payoutLog('Payout report not found', ['payid' => $payid]);
            return response()->json(['status' => false, 'message' => 'Report not found']);
        }
    
        $update = [
            'refno'  => $refno,
            'status' => $status === 'success' ? 'success' : ($status === 'failed' ? 'failed' : $report->status)
        ];
    
        $report->update($update);
    
        $this->payoutLog('Payout Report Updated', [
            'report_id' => $report->id,
            'update'    => $update
        ]);
    
        $user = User::find($report->user_id);
    
        if ($user && $user->payout_callback) {
            $this->merchantCallBackResponse(
                $user->payout_callback,
                $status,
                $report->txnid,
                $report->mytxnid,
                $report->amount,
                $refno,
                $timestamp
            );
        }
    
        return response()->json(['status' => true, 'message' => 'Payout callback processed']);
    }





    
    
    
    
    
    
    
    
    
    
    
    

//   public function nxtcallbkp(Request $request)
//     {
//         // dd("hello"); 
//     $this->payinLog("callback revieved");
//         // Store raw request for debugging
//         DB::table('micro_logs')->insert([
//             'product_response' => json_encode($request->all()),
//             'product_name' => 'NXT',
//             'created_at' => now(),
//             'updated_at' => now(),
//         ]);

//         $data = json_decode($request->getContent(), true);
//          $services = $data['data']['service'];
//         $this->payinLog($services);
//         // $data = json_decode($request->input('response'), true);

        
//         if($services == 'collection'){
//                       $this->payinLog('NXT PAyin  Callback Received', [
//                             'request_array' => $request->all(),
//                             'raw_content' => $request->getContent()
//                         ]);
//                          if (!$data) {
//                             $this->payinLog('Failed to decode NXT response', ['input' => $request->getContent()]);
//                             return response()->json(['status' => false, 'message' => 'Invalid response']);
//                         }
//                         $this->payinLog('$data', [
//                             '$data' => $data
                            
//                         ]);

//                         $payid = $data['data']['reference_id'] ?? null;
//                         $nxtStatus = $data['data']['status'] ?? null;
//                         $timestamp = $data['data']['updated_at'] ?? null;
//                         $this->payinLog('$payid', [
//                             '$payid' => $payid,
//                             '$nxtStatus' => $nxtStatus,
//                             '$timestamp' => $timestamp
//                         ]);
                
//                         if (!$payid) {
//                             $this->payinLog('payid missing in nxt response', ['response' => $data]);
//                             return response()->json(['status' => false, 'message' => 'Order ID missing']);
//                         }
                
//                         $report = Report::where('mytxnid', $payid)
//                             ->where('status', 'initiated')
//                             ->where('product', 'UPI')
//                             ->first();
                
//                         if (!$report) {
//                             $this->payinLog('No report found for payid', ['payid' => $payid]);
//                             return response()->json(['status' => false, 'message' => 'Report not found']);
//                         }
                
//                         $user = User::find($report->user_id);
//                         $refno = $data['data']['utr'] ?? null;
                
//                         // Prepare report update
//                         $updateOrder = [
//                             'option2' => $data['data']['upi_transaction_id'] ?? null, //upi_transaction_id
//                             'option3' => $data['data']['report_id'] ?? null,  //report id
//                         ];
                
//                         // Override reason if failed
//                         if ($nxtStatus === 'failed') {
//                             $updateOrder['option2'] = $data['data']['reason'] ?? null;
//                         }
                
//                         if ($refno) {
//                             $updateOrder['refno'] = $refno;
//                         }
                
//                         $updateOrder['status'] = $nxtStatus === 'paid' ? 'success' : ($nxtStatus === 'FAILED' ? 'failed' : $report->status);
                
//                         $report->update($updateOrder);
                
//                         $this->payinLog("Report updated", [
//                             'report_id' => $report->id,
//                             'update' => $updateOrder
//                         ]);
                
//                         // Trigger merchant callback if configured and valid
//                         if ($user->payin_callback) {
//                             $this->payinLog('Calling merchant callback', [
//                                 'callbackurl' => $user->payin_callback,
//                                 'status' => $nxtStatus,
//                                 'txnid' => $report->txnid,
//                                 'mytxnid' => $report->mytxnid,
//                                 'amount' => $report->amount,
//                                 'refno' => $refno,
//                                 'timestamp' => $timestamp
//                             ]);
                
//                             $this->merchantCallBackResponse(
//                                 $user->payin_callback,
//                                 $nxtStatus,
//                                 $report->txnid,
//                                 $report->mytxnid,
//                                 $report->amount,
//                                 $refno,
//                                 $timestamp
//                             );
//                         }
                
//                         $this->payinLog('NXT callback processing finished');
            
//         }elseif($services == 'payout'){
//                       $this->payoutLog('NXT payout  Callback Received', [
//                             'request_array' => $request->all(),
//                             'raw_content' => $request->getContent()
//                         ]);
//                         if (!$data) {
//                             $this->payoutLog('Failed to decode NXT response', ['input' => $request->getContent()]);
//                             return response()->json(['status' => false, 'message' => 'Invalid response']);
//                         }
//                         $this->payoutLog('$data', [
//                             '$data' => $data
                            
//                         ]);

//                         $payid = $data['data']['transaction_id'] ?? null;
//                         $nxtStatus = $data['data']['status'] ?? null;
//                         $timestamp = $data['data']['updated_at'] ?? null;
//                         $this->payoutLog('$payid', [
//                             '$payid' => $payid,
//                             '$nxtStatus' => $nxtStatus,
//                             '$timestamp' => $timestamp,
//                         ]);
                
//                         if (!$payid) {
//                             $this->payoutLog('payid missing in nxt response', ['response' => $data]);
//                             return response()->json(['status' => false, 'message' => 'Order ID missing']);
//                         }
                
//                         $report = Report::where('mytxnid', $payid)
//                             ->where('status', 'initiated')
//                             ->where('product', 'payout')
//                             ->first();
                
//                         if (!$report) {
//                             $this->payoutLog('No report found for payid', ['payid' => $payid]);
//                             return response()->json(['status' => false, 'message' => 'Report not found']);
//                         }
                
//                         $user = User::find($report->user_id);
//                         $refno = $data['data']['beneficiary']['utr'] ?? null;
                
                
//                         if ($refno) {
//                             $updateOrder['refno'] = $refno;
//                         }
                
//                         $updateOrder['status'] = $nxtStatus === 'paid' ? 'success' : ($nxtStatus === 'FAILED' ? 'failed' : $report->status);
                
//                         $report->update($updateOrder);
                
//                         $this->payoutLog("Report updated", [
//                             'report_id' => $report->id,
//                             'update' => $updateOrder
//                         ]);
                
//                         // Trigger merchant callback if configured and valid
//                         if ($user->payout_callback) {
//                             $this->payoutLog('Calling merchant callback', [
//                                 'callbackurl' => $user->payout_callback,
//                                 'status' => $nxtStatus,
//                                 'txnid' => $report->txnid,
//                                 'mytxnid' => $report->mytxnid,
//                                 'amount' => $report->amount,
//                                 'refno' => $refno,
//                                 'timestamp' => $timestamp
//                             ]);
                
//                             $this->merchantCallBackResponse(
//                                 $user->payout_callback,
//                                 $nxtStatus,
//                                 $report->txnid,
//                                 $report->mytxnid,
//                                 $report->amount,
//                                 $refno,
//                                 $timestamp
//                             );
//                         }
                
//                         $this->payoutLog('NXT payout callback processing finished');
        
            
//         }else{
//             dd("cant find services");
//         }
    


//         return response()->json(['status' => true, 'message' => 'NXT Ready to work']);
//     }    
    
    
}
