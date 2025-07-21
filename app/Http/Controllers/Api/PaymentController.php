<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Razorpay\Api\Api;
use App\User;
use App\Models\Cart;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;



class PaymentController extends Controller
{
    public function createOrder(Request $request){
        $user = auth()->user();
        $order = Order::create([
            'order_id' => 'ORD'.time().bin2hex(random_bytes(5)), // Generate a unique order ID
            'user_id' => auth()->user()->id,
            'address_id' => $request->address_id,
            'sub_total' => $request->subtotal,
            'quantity' => $request->totalquantity,
            'shippingcost' => $request->shippingcost,
            'tax' => $request->tax,
            'total_amount' => $request->total,
            'payment_method' => ($request->paymentMethod == 'online') ? 'razorpay' : 'cod',
            'payment_status' => ($request->paymentMethod == 'online') ? 'paid' : 'unpaid',
            'status' => 'pending',
            'shipping_id' => null // Set shipping_id to null since we're using address_id instead
        ]);
        foreach( $request->items as $product){
            OrderItem::create([
                'order_id' => $order->id,
                'product_id'=> $product['id'],
                'quantity'=> $product['quantity'],
                'price'=> $product['price'],
            ]);
            $cart = Cart::find($product['cart_id']);
            if ($cart) {
                $cart->order_id = $order->id;
                $cart->status='progress';
                $cart->save();
            }
        }
        $customer_name = $request->shipping['firstName']." ".$request->shipping['lastName'];
        $amountto = $order->total_amount;
        $amounttotal = round($amountto * 100);

        $api = new Api(env('RAZOR_KEY_ID'), env('RAZOR_KEY_SECRET'));
        $orderData = [
            'receipt'         => $order->order_id,
            'amount'          => $amounttotal,
            'currency'        => 'INR',
            'payment_capture' => 1,
            'notes'=> array('customer_name'=> $customer_name,'Customer_mobile'=> $user->mobile)
        ];
      //  \Log::info('Creating Razorpay order with data:', $orderData);

        $rzorder = $api->order->create($orderData);
        //dd($rzorder);

        if (!$rzorder || !isset($rzorder->id)) {
            \Log::error('Razorpay order creation failed:', ['response' => $rzorder]);
            return response()->json(['message' => 'Failed to create Razorpay order'], 500);
        }
        $order->transaction_id = $rzorder->id;
        $order->payment_details = json_encode($rzorder->toArray());
        $order->save();

        return response()->json([
            'razorpayOrderId' => $rzorder->id,
            'orderId' => $order->order_id,
            'amount' => $amounttotal,
            'currency' => 'INR',
            'rzdetails' => $rzorder->toArray()
        ]);
    }

}

