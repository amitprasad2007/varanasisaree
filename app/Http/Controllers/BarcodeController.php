<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Str;
use Picqer\Barcode\BarcodeGeneratorSVG;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class BarcodeController extends Controller
{
    public function productBarcode(Product $product)
    {
        if (empty($product->barcode)) {
            $product->barcode = $this->generateProductBarcodeValue($product);
            $product->save();
        }

        $generator = new BarcodeGeneratorSVG();
        $svg = $generator->getBarcode($product->barcode, $generator::TYPE_CODE_128, 2, 80);
        return response($svg)->header('Content-Type', 'image/svg+xml');
    }

    public function productQr(Product $product)
    {
        if (empty($product->barcode)) {
            $product->barcode = $this->generateProductBarcodeValue($product);
            $product->save();
        }

        $svg = QrCode::format('svg')->size(240)->margin(1)->generate($product->barcode);
        return response($svg)->header('Content-Type', 'image/svg+xml');
    }

    public function variantBarcode(ProductVariant $variant)
    {
        if (empty($variant->barcode)) {
            $variant->barcode = $this->generateVariantBarcodeValue($variant);
            $variant->save();
        }

        $generator = new BarcodeGeneratorSVG();
        $svg = $generator->getBarcode($variant->barcode, $generator::TYPE_CODE_128, 2, 80);
        return response($svg)->header('Content-Type', 'image/svg+xml');
    }

    public function variantQr(ProductVariant $variant)
    {
        if (empty($variant->barcode)) {
            $variant->barcode = $this->generateVariantBarcodeValue($variant);
            $variant->save();
        }

        $svg = QrCode::format('svg')->size(240)->margin(1)->generate($variant->barcode);
        return response($svg)->header('Content-Type', 'image/svg+xml');
    }

    private function generateProductBarcodeValue(Product $product): string
    {
        $prefix = 'PRD';
        $random = strtoupper(Str::random(6));
        $idPart = $product->id ? str_pad((string)$product->id, 6, '0', STR_PAD_LEFT) : strtoupper(Str::random(4));
        return sprintf('%s-%s-%s', $prefix, $random, $idPart);
    }

    private function generateVariantBarcodeValue(ProductVariant $variant): string
    {
        $prefix = 'VAR';
        $random = strtoupper(Str::random(6));
        $prodId = $variant->product_id ? str_pad((string)$variant->product_id, 6, '0', STR_PAD_LEFT) : '000000';
        $varId = $variant->id ? str_pad((string)$variant->id, 6, '0', STR_PAD_LEFT) : strtoupper(Str::random(4));
        return sprintf('%s-%s-%s-%s', $prefix, $random, $prodId, $varId);
    }
}


