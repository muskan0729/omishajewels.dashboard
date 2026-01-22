<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->tinyInteger('pre_kyc_status')->default(0)->comment('0 = not pre KYC, 1 = pre KYC done');
             $table->tinyInteger('kyc_rejected')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('pre_kyc_status');
            $table->dropColumn('kyc_rejected');
        });   
    }
};
