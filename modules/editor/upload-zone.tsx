import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession, signIn } from "next-auth/react";
import {
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import PaymentModal from "@/components/modals/payment-modal";

interface UploadZoneProps {
  onImageUpload: (imageUrl: string) => void;
}

const UploadZone = ({ onImageUpload }: UploadZoneProps) => {
  const { data: session, status } = useSession();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [usageData, setUsageData] = useState<{
    usageCount: number;
    usageLimit: number;
    plan: string;
    canUpload: boolean;
  } | null>(null);

  // check the usage on component mount (only if authenticated)
  useEffect(() => {
    if (session?.user) {
      checkUsage()?.catch(console.error);
    }
  }, [session]);

  const handleAuthRequired = () => {
    setShowAuthPrompt(true);
  };

  const handleSignIn = async () => {
    await signIn("google");
    setShowAuthPrompt(false);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    // Check authentication first
    if (!session?.user) {
      handleAuthRequired();
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [session]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Check authentication first
      if (!session?.user) {
        handleAuthRequired();
        return;
      }

      const files = Array.from(e.target.files || []);
      handleFiles(files);
    },
    [session]
  );

  const getUploadAuthParams = async () => {
    const response = await fetch("/api/upload-auth");

    if (!response.ok) {
      throw new Error("Failed to get upload auth params");
    }
    const data = await response?.json();

    return data;
  };

  const uploadToImageKit = async (file: File): Promise<string> => {
    try {
      // Get authentication parameters
      const { token, expire, signature, publicKey } =
        await getUploadAuthParams();

      const result = await upload({
        file,
        fileName: file?.name,
        folder: "pixora-uploads",
        expire,
        token,
        signature,
        publicKey,
        onProgress: (event) => {
          // Update progress if needed
          console.log(
            `Upload progress: ${(event.loaded / event.total) * 100}%`
          );
        },
      });

      return result.url || "";
    } catch (error) {
      if (error instanceof ImageKitInvalidRequestError) {
        throw new Error("Invalid upload request");
      } else if (error instanceof ImageKitServerError) {
        throw new Error("ImageKit server error");
      } else if (error instanceof ImageKitUploadNetworkError) {
        throw new Error("Network error during upload");
      } else {
        throw new Error("Upload failed");
      }
    }
  };

  const handleFiles = async (files: File[]) => {
    const imageFile = files?.find((file) => file.type.startsWith("image/"));
    if (imageFile) {
      setIsUploading(true);

      try {
        // Check usage first
        await checkUsage();

        // Update usage count
        await updateUsage();

        // Upload to ImageKit
        const imageUrl = await uploadToImageKit(imageFile);
        setUploadedImage(imageUrl);
        onImageUpload(imageUrl);
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const checkUsage = async () => {
    const response = await fetch("/api/usage");
    if (!response.ok) {
      throw new Error("Failed to check usage");
    }
    const data = await response.json();
    setUsageData(data);
    return data;
  };

  const updateUsage = async () => {
    const response = await fetch("/api/usage", { method: "POST" });
    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 403) {
        // Usage limit reached
        setUsageData(errorData);
        setShowPaymentModal(true);
        throw new Error("Usage limit reached");
      }
      throw new Error("Failed to update usage");
    }
    const data = await response.json();
    setUsageData(data);
    return data;
  };

  const clearImage = () => {
    setUploadedImage(null);
    onImageUpload("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      {uploadedImage ? (
        <div className="relative glass rounded-xl p-4 border border-card-border">
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 z-10 p-1 bg-background/80 rounded-full hover:bg-destructive/20 transition-colors"
          >
            <X className="h-4 w-4 text-foreground hover:text-destructive" />
          </button>

          <div className="aspect-square rounded-lg overflow-hidden">
            <img
              src={uploadedImage}
              alt="Uploaded Preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mt-3 text-center">
            <p className="text-sm font-medium text-foreground">
              {uploadedImage.startsWith("data:")
                ? "Local preview"
                : "Uploaded to cloud"}
            </p>
            <p className="text-xs text-muted-foreground">
              Ready for AI magic ✨
            </p>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`shadow-glass rounded-xl p-8 border-2 border-dashed border-gray-800 transition-all duration-300 cursor-pointer ${
            isDragOver
              ? "border-primary bg-primary/5 scale-105"
              : "border-card-border hover:border-primary/50 hover:bg-primary/5"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />

          <label
            htmlFor="file-upload"
            className="cursor-pointer block text-center"
          >
            <motion.div
              animate={isDragOver ? { scale: 1.1 } : { scale: 1 }}
              className="mb-4"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-4">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                ) : isDragOver ? (
                  <Upload className="w-8 h-8 text-primary animate-bounce" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-primary" />
                )}
              </div>
            </motion.div>

            <h3 className="text-lg font-semibold text-foreground mb-2">
              {isUploading
                ? "Uploading to cloud..."
                : isDragOver
                ? "Drop your photo here"
                : "Upload Photo"}
            </h3>

            <p className="text-muted-foreground text-sm mb-4">
              {isUploading
                ? "Please wait while we upload your image"
                : "Drag & drop or click to browse"}
            </p>

            <Button
              variant="outline"
              className="glass border-card-border"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Browse Files
                </>
              )}
            </Button>
          </label>
        </div>
      )}

      {/* Usage Info */}
      {usageData && (
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
            <span>
              Usage: {usageData.usageCount}/{usageData.usageLimit}
            </span>
            {usageData.plan === "Free" && (
              <Crown className="h-3 w-3 text-primary" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Supports JPG, PNG, WebP up to 10MB
          </p>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onUpgrade={() => {
          setShowPaymentModal(false);
        }}
        usageCount={usageData?.usageCount || 0}
        usageLimit={usageData?.usageLimit || 3}
      />

      {/* Authentication Prompt Modal */}
      {showAuthPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card border border-card-border rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Sign Up to Get Started
              </h3>
              
              <p className="text-muted-foreground text-sm mb-6">
                Create your free account to start editing photos with AI. 
                Get 3 free edits to try our magical tools!
              </p>
              
              <div className="space-y-3">
                <Button
                  onClick={handleSignIn}
                  className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign Up with Google
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => setShowAuthPrompt(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-4">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default UploadZone;