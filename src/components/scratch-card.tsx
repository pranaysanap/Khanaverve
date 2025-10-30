"use client";

import React, { useRef, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUserStore } from '@/stores/use-user-store';

export function ScratchCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [percent, setPercent] = useState<number>(() => 5 + Math.floor(Math.random() * 16)); // 5-20
  const [couponCode, setCouponCode] = useState<string>('');
  const { toast } = useToast();
  const addCoupon = useUserStore(state => state.addCoupon);

  useEffect(() => {
    setCouponCode(`SAVE${percent}`);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const rect = canvas.parentElement!.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Fill the canvas with a scratchable layer
    ctx.fillStyle = '#d1d5db'; // gray-300
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'destination-out';
  }, []);

  const handleScratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const pos = 'touches' in e ? e.touches[0] : e;
    const x = pos.clientX - rect.left;
    const y = pos.clientY - rect.top;

    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    checkRevealed();
  };

  const checkRevealed = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparentPixels++;
      }
    }

    const revealedPercentage = (transparentPixels / (canvas.width * canvas.height)) * 100;

    if (revealedPercentage > 50) {
      setIsRevealed(true);
      toast({
        title: 'Coupon Unlocked!',
        description: `You've unlocked ${percent}% off with code "${couponCode}"!`,
      });
      addCoupon({
          id: `c_${Date.now()}`,
          code: couponCode,
          description: `${percent}% off on subtotal + delivery + taxes`,
          discount: percent,
          type: 'percent',
          minOrder: 150,
          expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          isUsed: false,
      });
    }
  };

  return (
    <div className="relative w-full h-24 rounded-lg bg-secondary/20 flex items-center justify-center border-2 border-dashed">
      <span className="text-xl font-bold text-secondary-foreground z-0">
        {couponCode}
      </span>
      <canvas
        ref={canvasRef}
        onMouseMove={handleScratch}
        onTouchMove={handleScratch}
        className={`absolute top-0 left-0 w-full h-full rounded-md cursor-grab z-10 ${isRevealed ? 'opacity-0 transition-opacity duration-500' : ''}`}
      />
    </div>
  );
}
