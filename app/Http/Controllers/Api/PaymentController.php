<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Razorpay\Api\Api;
use App\Models\Cart;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;


class PaymentController extends Controller
{
    public function createOrder(Request $request){
        $customer = Auth::user();
        $order = Order::create([
            'order_id' => 'ORD-'.date('YmdHis').'-'.bin2hex(random_bytes(5)), // Generate a unique order ID
            'customer_id' => $customer->id,
            'address_id' => $request->address_id,
            'shipping_id' => 1, // Assuming a fixed shipping ID for this example
            'sub_total' => $request->subtotal,
            'quantity' => $request->totalquantity,
            'shipping_cost' => $request->shippingcost,
            'tax' => $request->tax,
            'discount' => $request->discount,
            'total_amount' => $request->total,
            'payment_method' => ($request->payment_method == 'online') ? 'razorpay' : 'cod',
            'payment_status' => ($request->payment_method == 'online') ? 'paid' : 'unpaid',
            'status' => 'pending'            
        ]);
        foreach( $request->items as $product){
            OrderItem::create([
                'order_id' => $order->id,
                'product_id'=> $product['id'],
                'product_variant_id' => $product['variant_id'] ?? null,
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
        $customer_name = $customer->name;
        $amountto = $order->total_amount;
        $amounttotal = round($amountto * 100);

        $api = new Api(env('RAZOR_KEY_ID'), env('RAZOR_KEY_SECRET'));
        $orderData = [
            'receipt'         => $order->order_id,
            'amount'          => $amounttotal,
            'currency'        => 'INR',
            'payment_capture' => 1,
            'notes'=> array('customer_name'=> $customer_name,'Customer_mobile'=> $customer->phone)
        ];
      //  Log::info('Creating Razorpay order with data:', $orderData);

        $rzorder = $api->order->create($orderData);
        //dd($rzorder);

        if (!$rzorder || !isset($rzorder->id)) {
            Log::error('Razorpay order creation failed:', ['response' => $rzorder]);
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

    public function paychecksave(Request $request){
        $customer = Auth::user();
        $payment_id = $request->response['razorpay_payment_id'];
        $order_id = $request->response['razorpay_order_id'];
        $signature = $request->response['razorpay_signature'];
        $totalamount = $request->orderData['total'];
        $api = new Api(env('RAZOR_KEY_ID'), env('RAZOR_KEY_SECRET'));
        $payment = $api->payment->fetch($payment_id);
        if ($payment->status === 'captured'){
            $payment_save = Payment::create([
                'payment_id'=> $payment->id,
                'amount'=> $payment->amount,
                'status'=> $payment->status,
                'method'=> $payment->method,
                'order_id'=> $payment->description,
                'rzorder_id'=> $payment->order_id,
                'card_id' => $payment->card_id,
                'email' => $payment->email,
                'contact'=> $payment->contact,
                'customer_id' =>$customer->id,
                'payment_details'=> json_encode($payment->toArray())
            ]);
            Order::where('transaction_id', $payment->order_id)->update(['payment_status' => 'paid','status'=>'processing']);
            return response()->json([
                'orderId' => $payment->description,
                'success' => true
            ]);
        }else{
            $response = $payment->capture(array('amount' => $totalamount));
            $payment_save = Payment::create([
                'payment_id'=> $response->id,
                'amount'=> $response->amount,
                'status'=> $response->status,
                'method'=> $response->method,
                'order_id'=> $response->description,
                'rzorder_id'=> $response->order_id,
                'card_id' => $response->card_id,
                'email' => $response->email,
                'contact'=> $response->contact,
                'customer_id' =>$customer->id,
                'payment_details'=> json_encode($response->toArray())
            ]);
            Order::where('transaction_id', $response->order_id)->update(['payment_status' => 'paid','status'=>'process']);
            return response()->json([
                'orderId' => $response->description,
                'success' => true
            ]);
        }
    }

    public function getPaymentMethods(){
        return response()->json([
            'payment_methods' => [
                ['id' => 'cod', 'type' => 'COD', 'name' => 'Cash on Delivery' ],
                ['id' => 'online', 'type' => 'ONLINE', 'name' => 'Online Payment' ]               
            ]
        ]);
    }
}

