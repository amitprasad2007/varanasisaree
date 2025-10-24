<!doctype html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>Invoice {{ $sale->invoice_number }}</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; border: 1px solid #ddd; }
        .text-right { text-align: right; }
    </style>
    <script>window.onload = function(){ window.print(); };</script>
    </head>
<body>
<div class="container">
   <a href="{{ route('pos.index') }}"> <img src="{{ asset('images/logo.png') }}" alt="Logo" class="logo"></a>
    <div class="header">
        <div>
            <h2>Invoice</h2>
            <div>Invoice #: {{ $sale->invoice_number }}</div>
            <div>Date: {{ $sale->created_at->format('d M Y H:i') }}</div>
        </div>
        <div>
            <strong>Customer</strong><br>
            {{ optional($sale->customer)->name ?? 'Walk-in Customer' }}<br>
            {{ optional($sale->customer)->phone }}<br>
            {{ optional($sale->customer)->address }}
        </div>
    </div>

    <table>
        <thead>
        <tr>
            <th>#</th>
            <th>Item</th>
            <th>SKU</th>
            <th class="text-right">Qty</th>
            <th class="text-right">Price</th>
            <th class="text-right">Line Total</th>
        </tr>
        </thead>
        <tbody>
        @foreach($sale->items as $index => $item)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $item->name }}</td>
                <td>{{ $item->sku }}</td>
                <td class="text-right">{{ $item->quantity }}</td>
                <td class="text-right">{{ number_format($item->price, 2) }}</td>
                <td class="text-right">{{ number_format($item->line_total, 2) }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>

    <table style="margin-top:16px">
        <tr>
            <td class="text-right">Subtotal</td>
            <td class="text-right" style="width: 160px">{{ number_format($sale->subtotal, 2) }}</td>
        </tr>
        @if($sale->discount_type)
        <tr>
            <td class="text-right">Discount ({{ $sale->discount_type === 'percent' ? $sale->discount_value.'%' : '₹'.$sale->discount_value }})</td>
            <td class="text-right">-{{ number_format($sale->discount_type === 'percent' ? $sale->subtotal * $sale->discount_value / 100 : $sale->discount_value, 2) }}</td>
        </tr>
        @endif
        @if($sale->tax_percent)
        <tr>
            <td class="text-right">Tax ({{ $sale->tax_percent }}%)</td>
            <td class="text-right">{{ number_format($sale->tax_amount, 2) }}</td>
        </tr>
        @endif
        <tr>
            <td class="text-right"><strong>Total</strong></td>
            <td class="text-right"><strong>{{ number_format($sale->total, 2) }}</strong></td>
        </tr>
        <tr>
            <td class="text-right">Paid</td>
            <td class="text-right">{{ number_format($sale->paid_total, 2) }}</td>
        </tr>
    </table>
</div>
</body>
</html>


