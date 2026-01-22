<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use App\Models\Report;
use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function createReport(Request $request)
    {
        try {
            // Validate the request
            $validatedData = $request->validate([
                'user_id'           => 'required|exists:users,id',
                'mobile'            => 'nullable|string|max:10',
                'amount'            => 'nullable|numeric',
                'charge'            => 'nullable|numeric',
                'profit'            => 'nullable|numeric',
                'gst'               => 'nullable|numeric',
                'tds'               => 'nullable|numeric',
                'apitxnid'          => 'nullable|string|max:255',
                'txnid'             => 'nullable|string|max:255',
                'payid'             => 'nullable|string|max:255',
                'refno'             => 'nullable|string|max:255',
                'description'       => 'nullable|string',
                'remark'            => 'nullable|string',
                'option1'           => 'nullable|string|max:255',
                'option2'           => 'nullable|string|max:255',
                'option3'           => 'nullable|string|max:255',
                'option4'           => 'nullable|string|max:255',
                'status'            => 'nullable|in:pending,success,failed,reversed,refunded,complete,initiated',
                'payment_platform'  => 'nullable|in:api,portal,app',
                'payout_amount'     => 'nullable|numeric',
                'payin_amount'      => 'nullable|numeric',
                'transaction_type'    => 'nullable|in:credit,debit,none',
                'product'           => 'nullable|in:fund_loadwallet,UPI,payout,upicollect,fund_transfer',
                'mytxnid'           => 'nullable|string|max:255',
                'aepstype'          => 'nullable|string|max:255',
                'payee_vpa'         => 'nullable|string|max:255',
                'payer_vpa'         => 'nullable|string|max:255',
                'payer_mobile'      => 'nullable|string|max:20',
                'payer_acc_no'      => 'nullable|string|max:50',
                'payer_ifsc'        => 'nullable|string|max:20',
                'commission_inc_gst'=> 'nullable|numeric',
                'bank_other_charges'=> 'nullable|numeric',
            ], [
                // Custom messages
                'user_id.required'          => 'User ID is required.',
                'user_id.exists'            => 'User ID does not exist in the users table.',
                'amount.numeric'            => 'Amount must be a valid number.',
                'charge.numeric'            => 'Charge must be a valid number.',
                'profit.numeric'            => 'Profit must be a valid number.',
                'gst.numeric'               => 'GST must be a valid number.',
                'tds.numeric'               => 'TDS must be a valid number.',
                'payout_amount.numeric'     => 'Payout amount must be a valid number.',
                'payin_amount.numeric'      => 'Payin amount must be a valid number.',
                'commission_inc_gst.numeric'=> 'Commission including GST must be a valid number.',
                'bank_other_charges.numeric'=> 'Bank other charges must be a valid number.',
                'status.in'                 => 'Invalid status value.',
                'payment_platform.in'       => 'Invalid payment platform.',
                'transaction_type.in'         => 'Invalid transaction type.',
                'product.in'                => 'Invalid product type.',
                'mobile.max'                => 'Mobile number can be at most 10 characters.',
                'payer_ifsc.max'            => 'IFSC code cannot exceed 20 characters.',
                'payer_acc_no.max'          => 'Account number cannot exceed 50 characters.',
                'option1.max'               => 'Option 1 field too long.',
                'option2.max'               => 'Option 2 field too long.',
                'option3.max'               => 'Option 3 field too long.',
                'option4.max'               => 'Option 4 field too long.',
            ]);
    
            // Create the report
            $report = Report::create($validatedData);
    
            // Return success response
            return response()->json([
                'message' => 'Report created successfully',
                'report'  => $report
            ], 201);
    
        } catch (ValidationException $e) {
            return response()->json([
                'error_code' => 422,
                'message'    => 'Validation failed',
                'errors'     => $e->errors()
            ], 422);
        }
    }
    
//new report without crypto
   public function ReportRecordsList(Request $request)
{
    try {
        $user = Auth::user();

        $query = Report::query()
            ->select([
                'id',
                'user_id',
                'product',
                'status',
                'amount',
                'created_at'
            ])
            ->with([
                'user:id,name,email'
            ]);

        // Role-based filter
        if ($user->role_type !== 'admin') {
            $query->where('user_id', $user->id);
        }

        // Filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('product')) {
            $product = $request->product;
            is_array($product)
                ? $query->whereIn('product', $product)
                : $query->where('product', $product);
        }

        if ($request->filled('from_date')) {
            $query->whereDate(
                'created_at',
                '>=',
                Carbon::parse($request->from_date)->startOfDay()
            );
        }

        if ($request->filled('to_date')) {
            $query->whereDate(
                'created_at',
                '<=',
                Carbon::parse($request->to_date)->endOfDay()
            );
        }

        // Pagination (VERY IMPORTANT)
        $reports = $query
            ->orderByDesc('id')
            ->paginate($request->get('per_page', 500));

        return response()->json([
            'status'  => true,
            'message' => 'Report records fetched successfully',
            'data'    => $reports
        ], 200);

    } catch (\Exception $e) {
        \Log::error("Report fetch error: ".$e->getMessage());

        return response()->json([
            'status'  => false,
            'message' => 'Something went wrong',
        ], 500);
    }
}


// new CollectionRecord without crypto 
    public function CollectionRecord(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['message' => 'User not authenticated'], 401);
            }
    
            $todayStart = now()->startOfDay();
            $todayEnd   = now()->endOfDay();
            $cutoff     = now()->subMinutes(30);
    
            Log::channel('reports')->info('CollectionRecord started', [
                'user_id' => $user->id,
                'role_type' => $user->role_type,
            ]);
    
            // -------------------------------
            // Base query
            // -------------------------------
            $baseQuery = Report::query();
            if ($user->role_type !== 'admin') {
                $baseQuery->where('user_id', $user->id);
            }
    
            // -------------------------------
            // Aggregate totals
            // -------------------------------
            $total_payin_amount  = (clone $baseQuery)
                ->where('status', 'success')
                ->where('product', 'UPI')
                ->sum('amount');
    
            $total_payout_amount = (clone $baseQuery)
                ->where('status', 'success')
                ->where('product', 'payout')
                ->sum('amount');
    
            $today_payin  = (clone $baseQuery)
                ->where('status', 'success')
                ->where('product', 'UPI')
                ->whereBetween('created_at', [$todayStart, $todayEnd])
                ->sum('amount');
    
            $today_payout = (clone $baseQuery)
                ->where('status', 'success')
                ->where('product', 'payout')
                ->whereBetween('created_at', [$todayStart, $todayEnd])
                ->sum('amount');
    
            // -------------------------------
            // Payin summary
            // -------------------------------
            $payinSums = (clone $baseQuery)
                ->where('status', 'success')
                ->where('product', 'UPI')
                ->where('description', 'Payment initiated')
                ->whereBetween('created_at', [$todayStart, $todayEnd])
                ->selectRaw('SUM(payin_rolling_amount) as rolling, SUM(payin_amount) as payin, SUM(profit) as profit')
                ->first();
    
            $PayinRollingAmount_current = round($payinSums->rolling ?? 0, 2);
            $PayingAmount_current       = round($payinSums->payin ?? 0, 2);
            $PayinProfitAmount_current  = round($payinSums->profit ?? 0, 2);
    
     Log::channel('reports')->info('new CollectionRecord started', [
                '$PayinRollingAmount_current' =>$PayinRollingAmount_current,
                '$PayingAmount_current' => $PayingAmount_current,
                '$PayinProfitAmount_current' => $PayinProfitAmount_current,
            ]);
    
            // -------------------------------
            // Wallet update
            // -------------------------------
            if ($PayinRollingAmount_current > 0 || $PayingAmount_current > 0 || $PayinProfitAmount_current > 0) {
    
                (clone $baseQuery)
                    ->where('status', 'success')
                    ->where('product', 'UPI')
                    ->where('description', 'Payment initiated')
                    ->whereBetween('created_at', [$todayStart, $todayEnd])
                    ->update(['description' => 'Payment counted']);
                    
                    Log::channel('reports')->info('new CollectionRecord before save started', [
                'rolling_amount' =>$user->rolling_amount,
                'payin_wallet' => $user->payin_wallet,
                'total_charges' => $user->total_charges,
            ]);
    
                $user->rolling_amount = ($user->rolling_amount ?? 0) + $PayinRollingAmount_current;
                $user->payin_wallet   = ($user->payin_wallet ?? 0) + $PayingAmount_current;
                $user->total_charges  = ($user->total_charges ?? 0) + $PayinProfitAmount_current;
                $user->save();
                
               Log::channel('reports')->info('new CollectionRecord after save started', [
                'rolling_amount' =>$user->rolling_amount,
                'payin_wallet' => $user->payin_wallet,
                'total_charges' => $user->total_charges,
            ]);
            
            }
            
            // --------------------------------
            // PayIN Failed Callback (Auto Timeout)   
            // --------------------------------
            
            $timeoutTime = now()->subMinutes(20);
            
            (clone $baseQuery)
                ->where('product', 'UPI')
                ->where('status', 'initiated')
                ->where('created_at', '<=', $timeoutTime)
                ->chunkById(100, function ($payINFailedCallBack) use ($user) {
            
                    foreach ($payINFailedCallBack as $report) {
            
                        Log::info("🧾 [Processing Report]", [
                            'report_id' => $report->id,
                            'txnid'     => $report->txnid,
                            'amount'    => $report->amount,
                        ]);
            
                        try {
                            DB::beginTransaction();
            
                            // Mark report as FAILED
                            $report->update([
                                'status'      => 'failed',
                                'description' => 'Payment Failed (auto-timeout after 20 mins)',
                            ]);
            
                            Log::info("✅ [Report Updated] Marked as FAILED", [
                                'report_id' => $report->id,
                                'time'      => now()->toDateTimeString(),
                            ]);
            
                            // Validate callback URL
                            if (empty($user->callbackurl)) {
                                Log::warning("⚠️ [Callback Skipped] Callback URL missing", [
                                    'report_id' => $report->id,
                                ]);
                                DB::commit();
                                continue;
                            }
            
                            // Send callback
                            $callbackService = app(\App\Services\CallbackService::class);
            
                            $payload = [
                                'callback_url' => $user->callbackurl,
                                'status'       => 'failed',
                                'txnid'        => $report->txnid,
                                'mytxnid'      => $report->mytxnid,
                                'amount'       => $report->amount,
                                'apitxnid'     => $report->apitxnid,
                                'timestamp'    => now()->timestamp,
                            ];
            
                            Log::debug("📦 [Callback Payload]", $payload);
            
                            $callbackResponse = $callbackService->merchantCallBackResponse(
                                $user->callbackurl,
                                'failed',
                                $report->txnid,
                                $report->mytxnid,
                                $report->amount,
                                $report->apitxnid,
                                now()->format('Y-m-d H:i:s')
                            );
            
                            Log::info("📨 [Callback Sent]", [
                                'report_id' => $report->id,
                                'response'  => $callbackResponse,
                            ]);
            
                            DB::commit();
            
                        } catch (\Throwable $e) {
                            DB::rollBack();
            
                            Log::error("❌ [Report Processing Failed]", [
                                'report_id' => $report->id,
                                'error'     => $e->getMessage(),
                                'trace'     => $e->getTraceAsString(),
                            ]);
                        }
                    }
                });

            // -------------------------------
            // Payout refunds
            // -------------------------------
            $payoutRefundSums = (clone $baseQuery)
                ->where('product', 'payout')
                ->whereIn('status', ['pending','failed'])
                ->whereBetween('created_at', [$todayStart, $todayEnd])
                ->where('created_at', '<=', $cutoff)
                ->selectRaw('SUM(amount + profit) as total')
                ->first();
    
            $payout_refunded = round($payoutRefundSums->total ?? 0, 2);
    
            // -------------------------------
            // Transaction & month-wise summary
            // -------------------------------
            $transactionStatusQuery = DB::table('reports');
    
            if ($user->role_type !== 'admin') {
                $transactionStatusQuery->where('user_id', $user->id);
            }
    
            // $transactionStatusCounts = $transactionStatusQuery
            //     ->select('product', DB::raw('COUNT(*) as total'))
            //     ->groupBy('product')
            //     ->pluck('total', 'product');
            
            $data = $transactionStatusQuery
            ->select(
                'product',
                'status',
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('product', 'status')
            ->get();

            $transactionStatusCounts = [];
            
            foreach ($data as $row) {
                $transactionStatusCounts[$row->product][$row->status] = $row->total;
            }

    
            $monthWiseStatusQuery = DB::table('reports');
    
            if ($user->role_type !== 'admin') {
                $monthWiseStatusQuery->where('user_id', $user->id);
            }
    
    
            $monthWiseStatusCounts = $monthWiseStatusQuery
            ->select(
                DB::raw("MAX(DATE_FORMAT(created_at, '%M %Y')) as month_name"),
        
                // Payin Success Count
                DB::raw("SUM(CASE WHEN product = 'UPI' AND status = 'success' THEN 1 ELSE 0 END) as payin_count"),
        
                // Payin Success Amount
                DB::raw("SUM(CASE WHEN product = 'UPI' AND status = 'success' THEN amount ELSE 0 END) as payin_amount"),
        
                // Payout Success Count
                DB::raw("SUM(CASE WHEN product = 'PAYOUT' AND status = 'success' THEN 1 ELSE 0 END) as payout_count"),
        
                // Payout Success Amount
                DB::raw("SUM(CASE WHEN product = 'PAYOUT' AND status = 'success' THEN amount ELSE 0 END) as payout_amount")
            )
            ->groupBy(DB::raw("DATE_FORMAT(created_at, '%Y-%m')"))
            ->orderBy(DB::raw("DATE_FORMAT(created_at, '%Y-%m')"), 'asc')
            ->get();
            
            // -------------------------------
            // Cashfree payout balance (Only for USER)
            // -------------------------------
            $cashfree_balance = null;
            
            if ($user->role_type === 'admin') {
            
                $curl = curl_init();
            
                curl_setopt_array($curl, array(
                    CURLOPT_URL => 'https://soulfuloverseas.com/Cashfree/CFBalance/',
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_ENCODING => '',
                    CURLOPT_MAXREDIRS => 10,
                    CURLOPT_TIMEOUT => 0,
                    CURLOPT_FOLLOWLOCATION => true,
                    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                    CURLOPT_CUSTOMREQUEST => 'GET',
                ));
            
                $response = curl_exec($curl);
                curl_close($curl);
            
                 // Decode JSON
                    $json = json_decode($response, true);
                
                    // Get only availableBalance
                    $available_balance = $json['data']['availableBalance'] ?? 0;
            }


    
            // -------------------------------
            // Response
            // -------------------------------
            return response()->json([
                'status' => true,
                'message' => 'Collection summary fetched successfully',
                'role_type' => $user->role_type,
    
                'total_payin_amount'         => number_format($total_payin_amount, 2, '.', ''),
                'total_payout_amount'        => number_format($total_payout_amount, 2, '.', ''),
                'today_payin'                => number_format($today_payin, 2, '.', ''),
                'today_payout'               => number_format($today_payout, 2, '.', ''),
                'payout_wallet'              => $user->payout_wallet ?? 0,
                'PayinRollingAmount_current' => number_format($PayinRollingAmount_current, 2, '.', ''),
                'PayingAmount_current'       => number_format($PayingAmount_current, 2, '.', ''),
                'PayinProfitAmount_current'  => number_format($PayinProfitAmount_current, 2, '.', ''),
                'PayinRollingAmount'         => $user->rolling_amount ?? 0,
                'PayingAmount'               => $user->payin_wallet ?? 0,
                'PayinProfitAmount'          => $user->total_charges ?? 0,
                'payout_refunded'            => $payout_refunded,
                'transactionStatusCounts'    => $transactionStatusCounts,
                'monthWiseStatusCounts'      => $monthWiseStatusCounts,
                 // ADD THIS
                'cashfree_balance'           => $available_balance ?? null,  // only visible for admin
            ], 200);
    
        } catch (\Exception $e) {
            Log::error("CollectionRecord error for user {$user->id}: " . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'Something went wrong while fetching collection summary',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

// new MerchantCollection without CRYPTO
    public function MerchantCollection(Request $request)
    {
        try {
            $today = now()->setTimezone('Asia/Kolkata')->toDateString();
    
            $user = Auth::user();
            if (!$user) {
                return response()->json(['message' => 'User not authenticated'], 401);
            }
    
            $todayStart = now()->startOfDay();
            $todayEnd   = now()->endOfDay();
    
            // Determine merchant
            if ($user->role_type === 'admin') {
                $merchantId = $request->merchant_id;
                if (!$merchantId) {
                    return response()->json([
                        'status' => false,
                        'message' => 'merchant_id is required for admin'
                    ], 400);
                }
            } else {
                $merchantId = $user->id;
            }
    
            // Fetch merchant
            $merchant = User::find($merchantId);
            if (!$merchant) {
                return response()->json([
                    'status' => false,
                    'message' => 'Merchant not found'
                ], 404);
            }
    
            // Base query
            $baseQuery = Report::query()->where('user_id', $merchantId);
    
            // ---------------- Totals ----------------
            $total_payin_amount  = (clone $baseQuery)->where('status', 'success')->where('product', 'UPI')->sum('amount');
            $total_payout_amount = (clone $baseQuery)->where('status', 'success')->where('product', 'payout')->sum('amount');
    
            $today_payin  = (clone $baseQuery)->where('status', 'success')->where('product', 'UPI')->whereBetween('created_at', [$todayStart, $todayEnd])->sum('amount');
            $today_payout = (clone $baseQuery)->where('status', 'success')->where('product', 'payout')->whereBetween('created_at', [$todayStart, $todayEnd])->sum('amount');
    
            // ---------------- Payin Summary ----------------
            $payinSums = (clone $baseQuery)
                ->where('status', 'success')
                ->where('product', 'UPI')
                ->where('description', 'Payment initiated')
                ->whereBetween('created_at', [$todayStart, $todayEnd])
                ->selectRaw('SUM(payin_rolling_amount) as rolling, SUM(payin_amount) as payin, SUM(profit) as profit')
                ->first();
    
            $PayinRollingAmount_current = round($payinSums->rolling ?? 0, 2);
            $PayingAmount_current       = round($payinSums->payin ?? 0, 2);
            $PayinProfitAmount_current  = round($payinSums->profit ?? 0, 2);
    
            // ---------------- Status Counts ----------------
            $payinTransactionStatusCounts = (clone $baseQuery)
                ->where('product', 'UPI')
                ->select('status', DB::raw('COUNT(*) as total'))
                ->groupBy('status')
                ->pluck('total', 'status');
    
            $payoutTransactionStatusCounts = (clone $baseQuery)
                ->where('product', 'payout')
                ->select('status', DB::raw('COUNT(*) as total'))
                ->groupBy('status')
                ->pluck('total', 'status');
    
            $todayPayinStatusCounts = (clone $baseQuery)
                ->where('product', 'UPI')
                ->whereDate('created_at', $today)
                ->select('status', DB::raw('COUNT(*) as total'))
                ->groupBy('status')
                ->pluck('total', 'status');
    
            $todayPayoutStatusCounts = (clone $baseQuery)
                ->where('product', 'payout')
                ->whereDate('created_at', $today)
                ->select('status', DB::raw('COUNT(*) as total'))
                ->groupBy('status')
                ->pluck('total', 'status');
    
                $todayPayingAmount = (clone $baseQuery)
                ->where('status', 'success')
                ->where('product', 'UPI')
                ->whereDate('created_at', Carbon::today())
                ->selectRaw('SUM(amount - profit) as total')
                ->value('total');

                    
   // Fetch total charges grouped by user_id and product
        $total_profit  = (clone $baseQuery)->where('status', 'success')->where('product', 'payout')->sum('charge');
                    
                    //todays payout charges 
                 $todayPayoutgAmount = (clone $baseQuery)
                    ->where('status', 'success')
                    ->where('product', 'payout')
                    ->whereDate('created_at', Carbon::today())
                    ->sum('charge');            
    
            $transactionStatusCounts = (clone $baseQuery)
                ->select('status', DB::raw('COUNT(*) as total'))
                ->groupBy('status')
                ->pluck('total', 'status');
    
            // ---------------- Month-wise ----------------
            $monthWiseStatusCounts = (clone $baseQuery)
                ->select(
                    DB::raw("MAX(DATE_FORMAT(created_at, '%M %Y')) as month_name"),
                    DB::raw('COUNT(*) as total')
                )
                ->groupBy(DB::raw("DATE_FORMAT(created_at, '%Y-%m')"))
                ->orderBy(DB::raw("DATE_FORMAT(created_at, '%Y-%m')"), 'asc')
                ->get();
    
            // ---------------- Refund ----------------
            // $refund_amount = (clone $baseQuery)
            //     ->where('status', 'refunded')
            //     ->where('product', 'payout')
            //     ->sum('amount');
    
            // ---------------- Response ----------------
            $responseData = [
                'total_payin_amount'         => number_format($total_payin_amount, 2, '.', ''),
                'total_payout_amount'        => number_format($total_payout_amount, 2, '.', ''),
                'today_payin'                => number_format($today_payin, 2, '.', ''),
                'today_payout'               => number_format($today_payout, 2, '.', ''),
                'payout_wallet'              => number_format($merchant->payout_wallet ?? 0, 2, '.', ''),
                'transactionStatusCounts'    => $transactionStatusCounts,
                'payinTransactionStatusCounts'  => $payinTransactionStatusCounts,
                'payoutTransactionStatusCounts' => $payoutTransactionStatusCounts,
                'todayPayinStatusCounts'     => $todayPayinStatusCounts,
                'todayPayoutStatusCounts'    => $todayPayoutStatusCounts,
                'monthWiseStatusCounts'      => $monthWiseStatusCounts,
                'PayinRollingAmount'         => number_format($merchant->rolling_amount ?? 0, 2, '.', ''),
                'PayingAmount'               => number_format($merchant->payin_wallet ?? 0, 2, '.', ''),
                'todayPayingAmount'          => number_format((float) $todayPayingAmount, 2, '.', ''),
                // 'todayPayoutgAmount'          => $todayPayoutgAmount,  
                'todayPayoutgAmount' => number_format((float) $todayPayoutgAmount, 2, '.', ''),
                'total_profit'               => number_format($total_profit, 2, '.', ''),
                'PayinProfitAmount'          => $merchant->total_charges ?? 0,
                'PayinRollingAmount_current' => number_format($PayinRollingAmount_current, 2, '.', ''),
                'PayingAmount_current'       => number_format($PayingAmount_current, 2, '.', ''),
                'PayinProfitAmount_current'  => number_format($PayinProfitAmount_current, 2, '.', ''),
                // 'refund_amount'              => number_format($refund_amount ?? 0, 2, '.', ''),
                
            ];
    
            return response()->json(array_merge([
                'status' => true,
                'message' => 'Merchant collection summary fetched successfully',
                'role_type' => $user->role_type,
                'merchant_id' => $merchantId
            ], $responseData), 200);
    
        } catch (\Exception $e) {
            Log::error("MerchantCollection error for user {$user->id}: " . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'Something went wrong while fetching merchant collection summary',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function MerchantRecords(Request $request)
    {
        $user = auth()::user();
        if (!$user) {
        return response()->json(['message' => 'User not authenticated'], 401);
    }
    if ($user->role_type === 'admin') {
        $merchantId = $request->merchant_id;
        if (!$merchantId) {
            return response()->json([
                'status' => false,
                'message' => 'merchant_id is required for admin'
            ], 400);
        }
    } else {
        $merchantId = $user->id;
    }

    // Fetch merchant
    $merchant = User::find($merchantId);
    if (!$merchant) {
        return response()->json([
            'status' => false,
            'message' => 'Merchant not found'
        ], 404);
    }      
       $transactions = \App\Models\Report::where('user_id', $merchantId)
                            ->orderBy('created_at', 'desc');
    
        // Calculate summaries
        $summary = [
            'today' => [
                'success' => (clone $transactions)->where('status', 'success')->whereDate('created_at', today())->count(),
                'failed' => (clone $transactions)->where('status', 'failed')->whereDate('created_at', today())->count(),
                'pending' => (clone $transactions)->where('status', 'pending')->whereDate('created_at', today())->count(),
            ],
            'week' => [
                'success' => (clone $transactions)->where('status', 'success')->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                'failed' => (clone $transactions)->where('status', 'failed')->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                'pending' => (clone $transactions)->where('status', 'pending')->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            ],
            'month' => [
                'success' => (clone $transactions)->where('status', 'success')->whereMonth('created_at', now()->month)->count(),
                'failed' => (clone $transactions)->where('status', 'failed')->whereMonth('created_at', now()->month)->count(),
                'pending' => (clone $transactions)->where('status', 'pending')->whereMonth('created_at', now()->month)->count(),
            ],
            'year' => [
                'success' => (clone $transactions)->where('status', 'success')->whereYear('created_at', now()->year)->count(),
                'failed' => (clone $transactions)->where('status', 'failed')->whereYear('created_at', now()->year)->count(),
                'pending' => (clone $transactions)->where('status', 'pending')->whereYear('created_at', now()->year)->count(),
            ],
        ];
    
        return response()->json([
            'status' => true,
            'merchant' => $merchant,
            'summary' => $summary,
        ]);        

}
    


   //   with crypto records 

    //   public function ReportRecordsList(Request $request)
    // {
    //     try {
    //         $user = Auth::user();
    
    //         // Start query
    //         $query = Report::with('user');
    
    //         // Normal users see only their own reports
    //         if ($user->role_type !== 'admin') {
    //             $query->where('user_id', $user->id);
    //         }
    
    //         // Fetch optional filters
    //         $status    = $request->query('status');     // success / failed / pending
    //         $bankType  = $request->query('product');    // payin / payout / crypto
    //         $fromDate  = $request->query('from_date');  
    //         $toDate    = $request->query('to_date');    
    
    //         // Filter by status
    //         if (!empty($status)) {
    //             $query->where('status', $status);
    //         }
    
    //         // Filter by bankType, but exclude crypto for non-crypto users
    //         if (!empty($bankType)) {
    //             if (is_array($bankType)) {
    //                 if ($user->role_type !== 'crypto') {
    //                     $bankType = array_filter($bankType, fn($p) => $p !== 'crypto');
    //                 }
    //                 if (!empty($bankType)) {
    //                     $query->whereIn('product', $bankType);
    //                 } else {
    //                     // No valid bankType remains (all were crypto), force empty result
    //                     $query->whereRaw('1 = 0');
    //                 }
    //             } else {
    //                 if ($bankType === 'crypto' && $user->role_type !== 'crypto') {
    //                     // Non-crypto users cannot query crypto
    //                     $query->whereRaw('1 = 0');
    //                 } else {
    //                     $query->where('product', $bankType);
    //                 }
    //             }
    //         } else {
    //             // If no filter and user is not crypto, exclude crypto automatically
    //             if ($user->role_type !== 'crypto') {
    //                 $query->where('product', '<>', 'crypto');
    //             }
    //         }
    
    //         // Date filtering
    //         if ($fromDate && $toDate) {
    //             $query->whereBetween('created_at', [
    //                 Carbon::parse($fromDate)->startOfDay(),
    //                 Carbon::parse($toDate)->endOfDay()
    //             ]);
    //         } elseif ($fromDate) {
    //             $query->whereDate('created_at', '>=', Carbon::parse($fromDate)->startOfDay());
    //         } elseif ($toDate) {
    //             $query->whereDate('created_at', '<=', Carbon::parse($toDate)->endOfDay());
    //         }
    
    //         // Fetch results
    //         $reports = $query->orderBy('id', 'desc')->get();
    
    //         return response()->json([
    //             'status'  => true,
    //             'message' => 'Report records fetched successfully',
    //             'total'   => $reports->count(),
    //             'data'    => $reports,
    //         ], 200);
    
    //     } catch (\Exception $e) {
    //         \Log::error("Error fetching reports for user {$user->id}: " . $e->getMessage());
    
    //         return response()->json([
    //             'status'  => false,
    //             'message' => 'Something went wrong while fetching report records',
    //             'error'   => $e->getMessage(),
    //         ], 500);
    //     }
    // }
    
    // public function CollectionRecord(Request $request)
    // {
    //     try {
    //         $user = Auth::user();
    //         if (!$user) {
    //             return response()->json(['message' => 'User not authenticated'], 401);
    //         }
    
    //         $todayStart = now()->startOfDay();
    //         $todayEnd   = now()->endOfDay();
    //         $cutoff     = now()->subMinutes(30);
    
    //         Log::channel('reports')->info('CollectionRecord started', [
    //             'user_id' => $user->id,
    //             'role_type' => $user->role_type,
    //         ]);
    
    //         // -------------------------------
    //         // Base query: own reports for user, all reports for admin
    //         // -------------------------------
    //         $baseQuery = Report::query();
    //         if ($user->role_type !== 'admin') {
    //             $baseQuery->where('user_id', $user->id);
    //         }
    
    //         // -------------------------------
    //         // Aggregate totals
    //         // -------------------------------
    //         $total_payin_amount  = (clone $baseQuery)
    //             ->where('status', 'success')
    //             ->where('product', 'UPI')
    //             ->sum('amount');
                
    //         $total_crypto  = (clone $baseQuery)
    //             ->where('status', 'success')
    //             ->where('product', 'CRYPTO')
    //             ->sum('amount');
                
    //         $total_crypto_payout  = (clone $baseQuery)
    //             ->where('status', 'success')
    //             ->where('product', 'CRYPTO_Payout')
    //             ->sum('amount');
    
    //         $total_payout_amount = (clone $baseQuery)
    //             ->where('status', 'success')
    //             ->where('product', 'payout')
    //             ->sum('amount');
    
    //         $today_payin  = (clone $baseQuery)
    //             ->where('status', 'success')
    //             ->where('product', 'UPI')
    //             ->whereBetween('created_at', [$todayStart, $todayEnd])
    //             ->sum('amount');
                
    //         $today_crypto  = (clone $baseQuery)
    //             ->where('status', 'success')
    //             ->where('product', 'CRYPTO')
    //             ->whereBetween('created_at', [$todayStart, $todayEnd])
    //             ->sum('amount');
            
    //          $today_crypto_payout  = (clone $baseQuery)
    //             ->where('status', 'success')
    //             ->where('product', 'CRYPTO_Payout')
    //             ->whereBetween('created_at', [$todayStart, $todayEnd])
    //             ->sum('amount');
    
    //         $today_payout = (clone $baseQuery)
    //             ->where('status', 'success')
    //             ->where('product', 'payout')
    //             ->whereBetween('created_at', [$todayStart, $todayEnd])
    //             ->sum('amount');
    
    //         // -------------------------------
    //         // Payin summary for today (rolling/profit)
    //         // -------------------------------
    //         $payinSums = (clone $baseQuery)
    //             ->where('status', 'success')
    //             ->where('product', 'UPI')
    //             ->where('description', 'Payment initiated')
    //             ->whereBetween('created_at', [$todayStart, $todayEnd])
    //             ->selectRaw('SUM(payin_rolling_amount) as rolling, SUM(payin_amount) as payin, SUM(profit) as profit')
    //             ->first();
    
    //         $PayinRollingAmount_current = round($payinSums->rolling ?? 0, 2);
    //         $PayingAmount_current       = round($payinSums->payin ?? 0, 2);
    //         $PayinProfitAmount_current  = round($payinSums->profit ?? 0, 2);
    
    //         // -------------------------------
    //         // Update user wallet safely
    //         // -------------------------------
    //         if ($PayinRollingAmount_current > 0 || $PayingAmount_current > 0 || $PayinProfitAmount_current > 0) {
    
    //             // Mark transactions as counted
    //             (clone $baseQuery)
    //                 ->where('status', 'success')
    //                 ->where('product', 'UPI')
    //                 ->where('description', 'Payment initiated')
    //                 ->whereBetween('created_at', [$todayStart, $todayEnd])
    //                 ->update(['description' => 'Payment counted']);
    
    //             // Safely increment user wallet
    //             $user->rolling_amount = ($user->rolling_amount ?? 0) + $PayinRollingAmount_current;
    //             $user->payin_wallet   = ($user->payin_wallet ?? 0) + $PayingAmount_current;
    //             $user->total_charges  = ($user->total_charges ?? 0) + $PayinProfitAmount_current;
    //             $user->save();
    
    //             Log::channel('reports')->info('User wallet updated', [
    //                 'user_id' => $user->id,
    //                 'rolling_added' => $PayinRollingAmount_current,
    //                 'payin_added'   => $PayingAmount_current,
    //                 'profit_added'  => $PayinProfitAmount_current,
    //                 'rolling_amount' => $user->rolling_amount,
    //                 'payin_wallet'   => $user->payin_wallet,
    //                 'total_charges'  => $user->total_charges
    //             ]);
    //         }
    
    //         // -------------------------------
    //         // Payout refunds
    //         // -------------------------------
    //         $payoutRefundSums = (clone $baseQuery)
    //             ->where('product', 'payout')
    //             ->whereIn('status', ['pending','failed'])
    //             ->whereBetween('created_at', [$todayStart, $todayEnd])
    //             ->where('created_at', '<=', $cutoff)
    //             ->selectRaw('SUM(amount + profit) as total')
    //             ->first();
    
    //         $payout_refunded = round($payoutRefundSums->total ?? 0, 2);
    
    //         // -------------------------------
    //         // Transaction & month-wise summary
    //         // -------------------------------
            
    //         // $transactionStatusCounts = DB::table('reports')
    //         //     ->select('status', DB::raw('COUNT(*) as total'))
    //         //     ->groupBy('status')
    //         //     ->pluck('total', 'status');
            
    //         $transactionStatusQuery = DB::table('reports');
    
    //         if ($user->role_type !== 'admin') {
    //             $transactionStatusQuery->where('user_id', $user->id);
    //         }
            
    //         $transactionStatusCounts = $transactionStatusQuery
    //             ->select('status', DB::raw('COUNT(*) as total'))
    //             ->groupBy('status')
    //             ->pluck('total', 'status');
                
    //           $cryptoTransactionStatusCounts = $transactionStatusQuery
    //             ->where('product', 'CRYPTO')        // filter only crypto transactions
    //             ->select('status', DB::raw('COUNT(*) as total'))
    //             ->groupBy('status')
    //             ->pluck('total', 'status');

 
    
    //         // $monthWiseStatusCounts = DB::table('reports')
    //         //     ->select(
    //         //         DB::raw("MAX(DATE_FORMAT(created_at, '%M %Y')) as month_name"),
    //         //         DB::raw('COUNT(*) as total')
    //         //     )
    //         //     ->groupBy(DB::raw("DATE_FORMAT(created_at, '%Y-%m')"))
    //         //     ->orderBy(DB::raw("DATE_FORMAT(created_at, '%Y-%m')"), 'asc')
    //         //     ->get();
            
    //         $monthWiseStatusQuery = DB::table('reports');
    
    //         if ($user->role_type !== 'admin') {
    //             $monthWiseStatusQuery->where('user_id', $user->id);
    //         }
            
    //         $monthWiseStatusCounts = $monthWiseStatusQuery
    //             ->select(
    //                 DB::raw("MAX(DATE_FORMAT(created_at, '%M %Y')) as month_name"),
    //                 DB::raw('COUNT(*) as total')
    //             )
    //             ->groupBy(DB::raw("DATE_FORMAT(created_at, '%Y-%m')"))
    //             ->orderBy(DB::raw("DATE_FORMAT(created_at, '%Y-%m')"), 'asc')
    //             ->get();
                
    //             $cryptoMonthWiseStatusCounts = $monthWiseStatusQuery
    // ->where('product', 'CRYPTO')   // <-- added filter
    // ->select(
    //     DB::raw("MAX(DATE_FORMAT(created_at, '%M %Y')) as month_name"),
    //     DB::raw("COUNT(*) as total")
    // )
    // ->groupBy(DB::raw("DATE_FORMAT(created_at, '%Y-%m')"))
    // ->orderBy(DB::raw("DATE_FORMAT(created_at, '%Y-%m')"), 'asc')
    // ->get();

    
    
    //         // -------------------------------
    //         // Prepare response
    //         // -------------------------------
    //         $responseData = [
    //             'total_payin_amount'           => number_format($total_payin_amount, 2, '.', ''),
    //             'total_crypto'                 => number_format($total_crypto, 2, '.', ''),
    //              'total_crypto_payout'                 => number_format($total_crypto_payout, 2, '.', ''),
    //               'today_crypto'                 => number_format($today_crypto, 2, '.', ''),
    //               'today_crypto_payout'                 => number_format($today_crypto_payout, 2, '.', ''),
    //             'total_payout_amount'          => number_format($total_payout_amount, 2, '.', ''),
    //             'today_payin'                  => number_format($today_payin, 2, '.', ''),
    //             'today_payout'                 => number_format($today_payout, 2, '.', ''),
    //             'payout_wallet'                => $user->payout_wallet ?? 0,
    //             'PayinRollingAmount_current'   => number_format($PayinRollingAmount_current, 2, '.', ''),
    //             'PayingAmount_current'         => number_format($PayingAmount_current, 2, '.', ''),
    //             'PayinProfitAmount_current'    => number_format($PayinProfitAmount_current, 2, '.', ''),
    //             'PayinRollingAmount'           => $user->rolling_amount ?? 0,
    //             'PayingAmount'                 => $user->payin_wallet ?? 0,
    //             'PayinProfitAmount'            => $user->total_charges ?? 0,
    //             'payout_refunded'              => $payout_refunded,
    //             'transactionStatusCounts'      => $transactionStatusCounts,
    //              'cryptoTransactionStatusCounts'      => $cryptoTransactionStatusCounts,
    //             'monthWiseStatusCounts'        => $monthWiseStatusCounts,
    //             'cryptoMonthWiseStatusCounts'        => $cryptoMonthWiseStatusCounts,
    //         ];
    
    //         return response()->json(array_merge([
    //             'status' => true,
    //             'message' => 'Collection summary fetched successfully',
    //             'role_type' => $user->role_type
    //         ], $responseData), 200);
    
    //     } catch (\Exception $e) {
    //         Log::error("CollectionRecord error for user {$user->id}: " . $e->getMessage());
    //         return response()->json([
    //             'status'  => false,
    //             'message' => 'Something went wrong while fetching collection summary',
    //             'error'   => $e->getMessage(),
    //         ], 500);
    //     }
    // }
    
    //  public function MerchantCollection(Request $request)
    // {
    //     try {
    //         $today = now()->setTimezone('Asia/Kolkata')->toDateString();
    //         // dd($today);
    //         // $today = now()->toDateString();  
    
    //         $user = Auth::user(); // logged-in user
    //         if (!$user) {
    //             return response()->json(['message' => 'User not authenticated'], 401);
    //         }
    
    //         $todayStart = now()->startOfDay();
    //         $todayEnd   = now()->endOfDay();
    //         $cutoff     = now()->subMinutes(30);
    
    //         // Determine which merchant ID to fetch
    //         if ($user->role_type === 'admin') {
    //             $merchantId = $request->merchant_id;
    //             if (!$merchantId) {
    //                 return response()->json([
    //                     'status' => false,
    //                     'message' => 'merchant_id is required for admin'
    //                 ], 400);
    //             }
    //         } else {
    //             $merchantId = $user->id;
    //         }
    
    //         // Fetch merchant
    //         $merchant = User::find($merchantId);
    //         if (!$merchant) {
    //             return response()->json([
    //                 'status' => false,
    //                 'message' => 'Merchant not found'
    //             ], 404);
    //         }
    
    //         // Base query for transactions
    //         $baseQuery = Report::query()->where('user_id', $merchantId);
    
    //         // Totals
    //         $total_payin_amount  = (clone $baseQuery)->where('status', 'success')->where('product', 'UPI')->sum('amount');
    //         $total_crypto        = (clone $baseQuery)->where('status', 'success')->where('product', 'CRYPTO')->sum('amount');
    //         $total_crypto_payout = (clone $baseQuery)->where('status', 'success')->where('product', 'CRYPTO_Payout')->sum('amount');
    //         $total_payout_amount = (clone $baseQuery)->where('status', 'success')->where('product', 'payout')->sum('amount');
    
    //         $today_payin         = (clone $baseQuery)->where('status', 'success')->where('product', 'UPI')->whereBetween('created_at', [$todayStart, $todayEnd])->sum('amount');
    //         $today_crypto        = (clone $baseQuery)->where('status', 'success')->where('product', 'CRYPTO')->whereBetween('created_at', [$todayStart, $todayEnd])->sum('amount');
    //         $today_crypto_payout = (clone $baseQuery)->where('status', 'success')->where('product', 'CRYPTO_Payout')->whereBetween('created_at', [$todayStart, $todayEnd])->sum('amount');
    //         $today_payout        = (clone $baseQuery)->where('status', 'success')->where('product', 'payout')->whereBetween('created_at', [$todayStart, $todayEnd])->sum('amount');
         
         
    //              $payinSums = (clone $baseQuery)
    //                 ->where('status', 'success')
    //                 ->where('product', 'UPI')
    //                 ->where('description', 'Payment initiated')
    //                 ->whereBetween('created_at', [$todayStart, $todayEnd])
    //                 ->selectRaw('SUM(payin_rolling_amount) as rolling, SUM(payin_amount) as payin, SUM(profit) as profit')
    //                 ->first();
            
    //         $PayinRollingAmount_current = round($payinSums->rolling ?? 0, 2);
    //         $PayingAmount_current       = round($payinSums->payin ?? 0, 2);
    //         $PayinProfitAmount_current  = round($payinSums->profit ?? 0, 2);
    
    //         // Transaction Status Counts for UPI (Payin)
    //         $payinTransactionStatusCounts = (clone $baseQuery)
    //             ->where('product', 'UPI')
    //             ->select('status', DB::raw('COUNT(*) as total'))
    //             ->groupBy('status')
    //             ->pluck('total', 'status');
            
    //         // Transaction Status Counts for Payout
    //         $payoutTransactionStatusCounts = (clone $baseQuery)
    //             ->where('product', 'payout')    
    //             ->select('status', DB::raw('COUNT(*) as total'))
    //             ->groupBy('status')
    //             ->pluck('total', 'status');
                
    //         $todayPayinStatusCounts = (clone $baseQuery)
    //             ->where('product', 'UPI')
    //             ->whereDate('created_at', $today)
    //             ->select('status', DB::raw('COUNT(*) as total'))
    //             ->groupBy('status')
    //             ->pluck('total', 'status');
            
    //         $todayPayoutStatusCounts = (clone $baseQuery)
    //             ->where('product', 'payout')
    //             ->whereDate('created_at', $today)
    //             ->select('status', DB::raw('COUNT(*) as total'))
    //             ->groupBy('status')
    //             ->pluck('total', 'status');
    
    
    
    //          $todayPayingAmount = DB::table('users')
    //               ->whereDate('updated_at',Carbon::today())
    //               ->sum('payin_wallet');
    //         // Transaction Status Counts
    //         $transactionStatusCounts = (clone $baseQuery)
    //             ->select('status', DB::raw('COUNT(*) as total'))
    //             ->groupBy('status')
    //             ->pluck('total', 'status');
    
    //         $cryptoTransactionStatusCounts = (clone $baseQuery)
    //             ->where('product', 'CRYPTO')
    //             ->select('status', DB::raw('COUNT(*) as total'))
    //             ->groupBy('status')
    //             ->pluck('total', 'status');
    
    //         // Month-wise counts
    //         $monthWiseStatusCounts = (clone $baseQuery)
    //             ->select(
    //                 DB::raw("MAX(DATE_FORMAT(created_at, '%M %Y')) as month_name"),
    //                 DB::raw('COUNT(*) as total')
    //             )
    //             ->groupBy(DB::raw("DATE_FORMAT(created_at, '%Y-%m')"))
    //             ->orderBy(DB::raw("DATE_FORMAT(created_at, '%Y-%m')"), 'asc')
    //             ->get();
    
    //         $cryptoMonthWiseStatusCounts = (clone $baseQuery)
    //             ->where('product', 'CRYPTO')
    //             ->select(
    //                 DB::raw("MAX(DATE_FORMAT(created_at, '%M %Y')) as month_name"),
    //                 DB::raw('COUNT(*) as total')
    //             )
    //             ->groupBy(DB::raw("DATE_FORMAT(created_at, '%Y-%m')"))
    //             ->orderBy(DB::raw("DATE_FORMAT(created_at, '%Y-%m')"), 'asc')
    //             ->get();
    
    
    //             $refund_amount = (clone $baseQuery)
    //                 ->where('status', 'refunded')
    //                 ->where('product', 'payout')
    //                 ->sum('amount');
    
    //         // Prepare response
    //      $responseData = [
    //             'total_payin_amount'           => number_format($total_payin_amount, 2, '.', ''),
    //             'total_crypto'                 => number_format($total_crypto, 2, '.', ''),
    //             'total_crypto_payout'          => number_format($total_crypto_payout, 2, '.', ''),
    //             'today_crypto'                 => number_format($today_crypto, 2, '.', ''),
    //             'today_crypto_payout'          => number_format($today_crypto_payout, 2, '.', ''),
    //             'total_payout_amount'          => number_format($total_payout_amount, 2, '.', ''),
    //             'today_payin'                  => number_format($today_payin, 2, '.', ''),
    //             'today_payout'                 => number_format($today_payout, 2, '.', ''),
    //           'payout_wallet'                  => number_format($merchant->payout_wallet ?? 0, 2, '.', ''),
    //             'transactionStatusCounts'      => $transactionStatusCounts,
    //             'payinTransactionStatusCounts'   => $payinTransactionStatusCounts,
    //             'payoutTransactionStatusCounts'  => $payoutTransactionStatusCounts,
    //             'todayPayinStatusCounts'       => $todayPayinStatusCounts,  
    //             'todayPayoutStatusCounts'      => $todayPayoutStatusCounts,
    //             'cryptoTransactionStatusCounts'=> $cryptoTransactionStatusCounts,
    //             'monthWiseStatusCounts'        => $monthWiseStatusCounts,
    //             'cryptoMonthWiseStatusCounts'  => $cryptoMonthWiseStatusCounts,
    //             'PayinRollingAmount'           => number_format($merchant->rolling_amount ?? 0,2,'.',''),
    //             'PayingAmount'                 => number_format($merchant->payin_wallet ?? 0,2,'.',''),
    //             'todayPayingAmount'            => $todayPayingAmount,
    //             'PayinProfitAmount'            => $merchant->total_charges ?? 0,
    //             'PayinRollingAmount_current'   => number_format($PayinRollingAmount_current, 2, '.', ''),
    //             'PayingAmount_current'         => number_format($PayingAmount_current, 2, '.', ''),
    //             'PayinProfitAmount_current'    => number_format($PayinProfitAmount_current, 2, '.', ''), // <-- added
    //             'refund_amount'                => number_format($refund_amount ?? 0,2,'.',''),
    //         ];
    
    
    //         return response()->json(array_merge([
    //             'status' => true,
    //             'message' => 'Merchant collection summary fetched successfully',
    //             'role_type' => $user->role_type,
    //             'merchant_id' => $merchantId
    //         ], $responseData), 200);
    
    //     } catch (\Exception $e) {
    //         Log::error("MerchantCollection error for user {$user->id}: " . $e->getMessage());
    //         return response()->json([
    //             'status'  => false,
    //             'message' => 'Something went wrong while fetching merchant collection summary',
    //             'error'   => $e->getMessage(),
    //         ], 500);
    //     }
    // }
    
    

}
