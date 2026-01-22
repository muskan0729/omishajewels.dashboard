<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Otp;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Carbon;

class UserRegisterController extends Controller
{

   public function getUserBasicDetails(Request $request)
{
    $request->validate([
        'id' => 'required|integer'
    ]);

    $user = User::select('name', 'email', 'mobile_no')
        ->where('id', $request->id)
        ->first();

    if (!$user) {
        return response()->json([
            'status' => false,
            'message' => 'User not found'
        ], 404);
    }

    return response()->json([
        'status' => true,
        'data' => $user
    ], 200);
}

 /* ================= SEND MOBILE OTP ================= */
    public function sendMobileOtp(Request $request)
    {
        $request->validate([
            'mobile_no' => 'required|digits:10'
        ]);

        $otp = rand(100000, 999999);

        Otp::updateOrCreate(
            ['type' => 'mobile', 'value' => $request->mobile_no],
            [
                'otp' => $otp,
                'expires_at' => Carbon::now()->addMinutes(5),
            ]
        );

        return response()->json([
            'status' => true,
            'message' => 'Mobile OTP sent',
            'otp_for_testing' => $otp
        ]);
    }

    /* ================= VERIFY MOBILE OTP ================= */
    public function verifyMobileOtp(Request $request)
    {
        $request->validate([
            'mobile_no' => 'required|digits:10',
            'otp' => 'required|digits:6'
        ]);

        $otp = Otp::where([
            'type' => 'mobile',
            'value' => $request->mobile_no,
            'otp' => $request->otp
        ])->where('expires_at', '>=', now())->first();

        if (!$otp) {
            return response()->json(['message' => 'Invalid or expired OTP'], 400);
        }

        $otp->delete();

        return response()->json(['verified' => true]);
    }

    /* ================= SEND EMAIL OTP ================= */
    public function sendEmailOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $otp = rand(100000, 999999);

        Otp::updateOrCreate(
            ['type' => 'email', 'value' => $request->email],
            [
                'otp' => $otp,
                'expires_at' => Carbon::now()->addMinutes(5),
            ]
        );

        return response()->json([
            'status' => true,
            'message' => 'Email OTP sent',
            'otp_for_testing' => $otp
        ]);
    }

    /* ================= VERIFY EMAIL OTP ================= */
    public function verifyEmailOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|digits:6'
        ]);

        $otp = Otp::where([
            'type' => 'email',
            'value' => $request->email,
            'otp' => $request->otp
        ])->where('expires_at', '>=', now())->first();

        if (!$otp) {
            return response()->json(['message' => 'Invalid or expired OTP'], 400);
        }

        $otp->delete();

        return response()->json(['verified' => true]);
    }

    /* ================= FINAL REGISTER ================= */
   public function registernew(Request $request)
{
    $request->validate([
        'name' => 'required|string',
        'email' => 'required|email|unique:users,email',
        'mobile_no' => 'required|digits:10|unique:users,mobile_no',
        'password' => 'required|min:6|confirmed',
    ]);

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'mobile_no' => $request->mobile_no,
        'password' => Hash::make($request->password), // ✔ correct
        'account_status' => 1,
    ]);

    return response()->json([
        'registered' => true,
        'id' => $user->id
    ], 201);
}

public function updateUser(Request $request)
{
    try {
        // Fetch user by email or mobile_no
        if ($request->has('email')) {
            $user = User::where('email', $request->email)->first();
        } elseif ($request->has('mobile_no')) {
            $user = User::where('mobile_no', $request->mobile_no)->first();
        } else {
            return response()->json([
                'status' => false,
                'message' => 'Email or Mobile number is required to identify user'
            ], 400);
        }

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'User not found'
            ], 404);
        }

        // Validation
        $validatedData = $request->validate([
            'scheme_id'              => 'nullable|integer',
            'name'                   => 'nullable|string|max:255',
            'credentials_id'         => 'nullable|integer|exists:credentials,id',
            'email'                  => 'nullable|email|unique:users,email,' . $user->id,
            'mobile_no'              => 'nullable|string|max:15|unique:users,mobile_no,' . $user->id,
            'password'               => 'nullable|string|min:6',
            'business_mcc'           => 'nullable|string|max:50',
            'company_type'           => 'nullable|string|max:100',
            'company_pan_no'         => 'nullable|string|max:20',
            'company_gst_no'         => 'nullable|string|max:20',
            'cin_llpin'              => 'nullable|string|max:50',
            'date_of_incorporation'  => 'nullable|date',
            'account_holder_name'    => 'nullable|string|max:255',
            'bank_account_no'        => 'nullable|string|max:50',
            'ifsc_code'              => 'nullable|string|max:20',
            'address'                => 'nullable|string|max:255',
            'city'                   => 'nullable|string|max:100',
            'district'               => 'nullable|string|max:100',
            'state'                  => 'nullable|string|max:100',
            'pin_code'               => 'nullable|string|max:10',

            // FILES
            'company_pan_no_doc'     => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'company_gst_no_doc'     => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'cancel_cheque_doc'      => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'video_kyc'              => 'nullable|file|mimes:mp4,mov,avi|max:51200', // 50MB max

            // DIRECTOR INFO
            'director_info'                               => 'nullable|array',
            'director_info.*.director_name'               => 'nullable|string|max:255',
            'director_info.*.director_pan_no'             => 'nullable|string|max:20',
            'director_info.*.director_aadhar_no'          => 'nullable|string|max:20',
            'director_info.*.director_gender'             => 'nullable|string|in:male,female,other',
            'director_info.*.director_dob'                => 'nullable|date',
            'director_info.*.user_pan_doc'                => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'director_info.*.user_addhar_doc'             => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',

            'website_url'            => 'nullable|url|max:255',
            'description'            => 'nullable|string|max:500',
        ]);

        // Update password if provided
        if (!empty($validatedData['password'])) {
            $validatedData['password'] = Hash::make($validatedData['password']);
        }

        // Update user fields
        $user->fill($validatedData);

        // Handle company files
        foreach (['company_pan_no_doc', 'company_gst_no_doc', 'cancel_cheque_doc'] as $fileKey) {
            if ($request->hasFile($fileKey)) {
                $path = $request->file($fileKey)->store('merchant_docs', 'public');
                $user->{$fileKey} = $path;
            }
        }

        // Handle director info files
        if ($request->has('director_info')) {
            $directors = $request->input('director_info');

            foreach ($directors as $i => $dir) {
                $existingDirector = $user->director_info[$i] ?? [];

                if ($request->hasFile("director_info.$i.user_pan_doc")) {
                    $dir["user_pan_doc"] = $request->file("director_info.$i.user_pan_doc")->store('director_docs', 'public');
                } else {
                    $dir["user_pan_doc"] = $existingDirector["user_pan_doc"] ?? null;
                }

                if ($request->hasFile("director_info.$i.user_addhar_doc")) {
                    $dir["user_addhar_doc"] = $request->file("director_info.$i.user_addhar_doc")->store('director_docs', 'public');
                } else {
                    $dir["user_addhar_doc"] = $existingDirector["user_addhar_doc"] ?? null;
                }

                foreach (['director_name','director_pan_no','director_aadhar_no','director_gender','director_dob'] as $field) {
                    $dir[$field] = $dir[$field] ?? ($existingDirector[$field] ?? null);
                }

                $directors[$i] = $dir;
            }

            $user->director_info = $directors;
        }

        // Handle Video KYC
        if ($request->hasFile('video_kyc')) {
            $path = $request->file('video_kyc')->store('video_kyc', 'public');
            $user->video_kyc = $path;
        }

         $user->pre_kyc_status = 1;
        $user->save();

        return response()->json([
            'status'  => true,
            'message' => 'User updated successfully',
            'data'    => $user,
        ]);

    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'status'  => false,
            'message' => 'Validation failed',
            'errors'  => $e->errors(),
        ], 422);

    } catch (\Exception $e) {
        \Log::error("Error updating user: " . $e->getMessage());

        return response()->json([
            'status'  => false,
            'message' => 'Something went wrong while updating user',
            'error'   => $e->getMessage(),
        ], 500);
    }
}


public function updateMerchantKyc(Request $request)
{
    try {
        $validatedData = $request->validate([
            'id'                => 'required|exists:users,id',
            'scheme_id'         => 'nullable|integer',
            'credentials_id'    => 'nullable|integer',
            'payin_at_onboard'  => 'nullable|string',
            'payout_at_onboard' => 'nullable|string',
            'reject'            => 'nullable|boolean', // NEW: Reject flag
        ]);

        // Fetch merchant
        $merchant = User::findOrFail($validatedData['id']);

        // ❌ Stop if pre-KYC is not completed
        if ((int) $merchant->pre_kyc_status !== 1) {
            return response()->json([
                'message' => 'Pre-KYC not completed. Cannot approve/reject KYC.',
            ], 400);
        }

        // Remove id and reject from validated data so it doesn't get updated
        unset($validatedData['id'], $validatedData['reject']);

        // Update merchant fields
        $merchant->update($validatedData);

        // ✅ Handle approve or reject
        if (!empty($request->reject) && $request->reject == true) {
            $merchant->kyc = 0;          // Not approved
            $merchant->kyc_rejected = 1;   // Mark as rejected
            $merchant->save();

            return response()->json([
                'message'  => 'KYC rejected successfully',
                'merchant' => $merchant,
            ], 200);
        } else {
            $merchant->kyc = 1;          // Approve
            $merchant->kyc_rejected = 0;   // Clear rejected flag if any
            $merchant->save();

            return response()->json([
                'message'  => 'KYC approved successfully',
                'merchant' => $merchant,
            ], 200);
        }

    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'error_code' => 422,
            'message'    => 'Validation failed',
            'errors'     => $e->errors(),
        ], 422);
    }
}



}
