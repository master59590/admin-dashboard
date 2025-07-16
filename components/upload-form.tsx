"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
export function UploadForm() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [ranks, setRanks] = useState<
    { id: string; name: string; position: number }[]
  >([]);
  const [selectedRank, setSelectedRank] = useState(""); // ค่า default
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form inputs
    if (!name.trim()) {
      toast({
        title: "Missing product name",
        description: "Please enter a product name",
        variant: "destructive",
      });
      return;
    }

    if (!price.trim() || isNaN(Number(price))) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    if (!editStock.trim() || isNaN(Number(editStock))) {
      toast({
        title: "Invalid stock",
        description: "Please enter a valid stock number",
        variant: "destructive",
      });
      return;
    }

    if (!selectedRank) {
      toast({
        title: "Missing rank",
        description: "Please select a product rank",
        variant: "destructive",
      });
      return;
    }

    // Description is optional, so no validation needed here

    if (!image) {
      toast({
        title: "Missing image",
        description: "Please upload a product image",
        variant: "destructive",
      });
      return;
    }

    try {
      if (loading) return;
      setLoading(true);

      // Upload image to Firebase Storage
      const storageRef = ref(storage, `products/${Date.now()}_${image.name}`);
      const uploadResult = await uploadBytes(storageRef, image);
      const imageUrl = await getDownloadURL(uploadResult.ref);
      // const imageUrl = "https://via.placeholder.com/150" // Placeholder URL for testing
      // Add product to Firestore
      await addDoc(collection(db, "products"), {
        name,
        price: Number.parseFloat(price),
        description,
        imageUrl,
        stock: Number.parseInt(editStock),
        rank: ranks.find((r) => r.id === selectedRank)?.name || "",
        isPromotion: false,
        createdAt: new Date(),
      });

      toast({
        title: "Product added",
        description: "Your product has been successfully added",
      });

      // Reset form
      setName("");
      setPrice("");
      setEditStock("");
      setDescription("");
      setImage(null);
      setImagePreview(null);

      // Redirect to dashboard
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchRanks = async () => {
      const q = query(collection(db, "Rank"), orderBy("position"));
      const querySnapshot = await getDocs(q);
      const rankData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        position: doc.data().position,
      }));
      setRanks(rankData);
    };

    fetchRanks();
  }, []);

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              step="1"
              min="0"
              value={editStock}
              onChange={(e) => setEditStock(e.target.value)}
              placeholder="0"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rank">Rank</Label>
            <Select
              value={selectedRank}
              onValueChange={setSelectedRank}
              disabled={loading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select rank" />
              </SelectTrigger>
              <SelectContent>
                {ranks.map((rank) => (
                  <SelectItem key={rank.id} value={rank.id}>
                    {rank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description (optional)"
              className="w-full min-h-[100px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Product Image</Label>
            <div className="flex flex-col gap-4">
              <div className="relative flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 h-32">
                {imagePreview ? (
                  <div className="w-full h-full">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Upload className="h-8 w-8 mb-2" />
                    <p className="text-sm">Click to upload or drag and drop</p>
                  </div>
                )}
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload Product"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
