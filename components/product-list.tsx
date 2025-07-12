"use client";

import type React from "react";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PencilIcon, TrashIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl: string;
  rank: string;
  stock: number;
  beforePrice?: number;
  isPromotion?: boolean; // ✅ เพิ่มฟิลด์นี้เพื่อระบุว่าสินค้าเป็นโปรโมชั่นหรือไม่
}
interface Rank {
  id: string;
  name: string;
  position: number;
}
export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedPrice, setEditedPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editedPromotion, setEditedPromotion] = useState(false);
  const [editedRank, setEditedRank] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rankedProducts, setRankedProducts] = useState<
    Record<string, Product[]>
  >({});
  const [promotionProducts, setPromotionProducts] = useState<Product[]>([]);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [beforePrice, setBeforePrice] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const rankSnapshot = await getDocs(collection(db, "Rank"));

      // ดึงข้อมูลจากตาราง Rank
      const ranks: Rank[] = rankSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Rank, "id">),
      }));

      // เรียง Rank ตาม position
      const sortedRanks = ranks.sort((a, b) => a.position - b.position);

      // ดึงสินค้าจาก Products
      const productSnapshot = await getDocs(collection(db, "products"));
      const allProducts = productSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      // ✅ กรองเฉพาะสินค้าที่มี isPromotion = true
      const promotions = allProducts.filter((p) => p.isPromotion === true);
      setPromotionProducts(promotions);
      // จัดกลุ่มสินค้าตาม rank
      const grouped: Record<string, Product[]> = {};
      sortedRanks.forEach((rank) => {
        grouped[rank.name] = allProducts.filter(
          (product) => product.rank === rank.name
        );
      });

      setRankedProducts(grouped); // 👈 เก็บสินค้าแบบแยกตาม Rank
      setRanks(sortedRanks);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  useEffect(() => {
    if (editedPromotion && productToEdit) {
      setBeforePrice(productToEdit.price); // โหลดราคาต้นฉบับทันที
    } else if (!editedPromotion) {
      setBeforePrice(null); // ล้างออกเมื่อยกเลิก
    }
  }, [editedPromotion, productToEdit]);

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setProductToEdit(product);
    setEditedName(product.name);
    setEditedPrice(product.price.toString());
    setEditStock(product.stock.toString());
    setEditedDescription(product.description || "");
    setImagePreview(product.imageUrl);
    setEditDialogOpen(true);
    setEditedRank(product.rank || "STARTER"); // หรือค่า default เช่น "BRONZE"
    setEditedPromotion(!!product.isPromotion);
    setBeforePrice(product.price);
    setBeforePrice(product.isPromotion ? product.price : null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      setIsSubmitting(true);

      // Delete from Firestore
      await deleteDoc(doc(db, "products", productToDelete.id));

      // Delete image from Storage if it exists
      if (productToDelete.imageUrl) {
        try {
          // Extract the path from the URL
          const url = new URL(productToDelete.imageUrl);
          const imagePath = url.pathname.split("/o/")[1];
          if (imagePath) {
            const decodedPath = decodeURIComponent(imagePath.split("?")[0]);
            const imageRef = ref(storage, decodedPath);
            await deleteObject(imageRef);
          }
        } catch (imageError) {
          console.error("Error deleting image:", imageError);
          // Continue even if image deletion fails
        }
      }

      // Update local state
      setProducts(products.filter((p) => p.id !== productToDelete.id));

      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted",
      });
    } catch (err) {
      console.error("Error deleting product:", err);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleEdit = async () => {
    if (!productToEdit) return;

    // Validate inputs
    if (!editedName.trim()) {
      toast({
        title: "Missing product name",
        description: "Please enter a product name",
        variant: "destructive",
      });
      return;
    }

    if (!editedPrice.trim() || isNaN(Number(editedPrice))) {
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
        description: "Please enter a valid stock",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      let updatedImageUrl = productToEdit.imageUrl;

      // If there's a new image, upload it
      if (newImage) {
        const storageRef = ref(
          storage,
          `products/${Date.now()}_${newImage.name}`
        );
        const uploadResult = await uploadBytes(storageRef, newImage);
        updatedImageUrl = await getDownloadURL(uploadResult.ref);

        // Delete old image if it exists and is different
        if (
          productToEdit.imageUrl &&
          productToEdit.imageUrl !== updatedImageUrl
        ) {
          try {
            const url = new URL(productToEdit.imageUrl);
            const imagePath = url.pathname.split("/o/")[1];
            if (imagePath) {
              const decodedPath = decodeURIComponent(imagePath.split("?")[0]);
              const imageRef = ref(storage, decodedPath);
              await deleteObject(imageRef);
            }
          } catch (imageError) {
            console.error("Error deleting old image:", imageError);
            // Continue even if old image deletion fails
          }
        }
      }

      // Update in Firestore
      const productRef = doc(db, "products", productToEdit.id);
      await updateDoc(productRef, {
        name: editedName,
        price: Number(editedPrice),
        stock: Number(editStock),
        description: editedDescription,
        rank: editedRank,
        isPromotion: editedPromotion,
        beforePrice: editedPromotion ? beforePrice : null,
        imageUrl: updatedImageUrl,
        updatedAt: new Date(),
      });

      // Update local state
      const updatedProducts = products.map((p) =>
        p.id === productToEdit.id
          ? {
              ...p,
              name: editedName,
              price: Number(editedPrice),
              stock: Number(editStock),
              description: editedDescription,
              rank: editedRank,
              isPromotion: editedPromotion,
              imageUrl: updatedImageUrl,
            }
          : p
      );

      setProducts(updatedProducts);

      toast({
        title: "Product updated",
        description: "The product has been successfully updated",
      });

      // Reset state
      setEditDialogOpen(false);
      setBeforePrice(null);
      setProductToEdit(null);
      setNewImage(null);
      await fetchProducts();
    } catch (err) {
      console.error("Error updating product:", err);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="flex justify-center items-center p-8 bg-red-50 rounded-lg">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const hasProducts = Object.values(rankedProducts).some(
    (arr) => arr.length > 0
  );

  if (!hasProducts) {
    return (
      <div className="flex justify-center items-center p-8 bg-muted rounded-lg">
        <p className="text-muted-foreground">
          No products found. Add some products to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-10">
        {/* ✅ Section: Promotions */}
        {promotionProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-red-500 mb-4">
              🔥 Promotions !
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {promotionProducts.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden border-red-500 border shadow shadow-red-200"
                >
                  <div className="relative h-48 w-full bg-transparent  flex items-center justify-center">
                    <Image
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <CardContent className="p-4 relative min-h-[120px]">
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-through">
                        ${product.beforePrice}
                      </p>
                      <p className="text-muted-foreground">
                        ${product.price.toFixed(2)}
                      </p>
                      <p className="text-muted-foreground">
                        Stock : {product.stock}
                      </p>
                      {product.description && (
                        <p className="text-sm mt-2 text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* ปุ่มไอคอนมุมขวาล่าง */}
                    <div className="absolute bottom-2 right-2 flex space-x-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleEditClick(product)}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDeleteClick(product)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ✅ Section: Products by Rank */}
        <div className="space-y-10">
          {Object.entries(rankedProducts).map(([rank, productsInRank]) => (
            <div key={rank}>
              <h2 className="text-lg font-bold mb-3 uppercase">{rank}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.isArray(productsInRank) &&
                  productsInRank
                    .filter((p) => !p.isPromotion) // ✅ ไม่ซ้ำกับ Promotion
                    .map((product) => (
                      <Card
                        key={product.id}
                        className="relative overflow-hidden"
                      >
                        <div className="relative w-full h-48 bg-transparent flex items-center justify-center">
                          <Image
                            src={product.imageUrl || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-contain"
                          />
                        </div>

                        <CardContent className="p-4 pb-12">
                          {" "}
                          {/* เว้นพื้นที่ให้ปุ่มขวาล่าง */}
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-muted-foreground">
                            ${product.price.toFixed(2)}
                          </p>
                          <p className="text-muted-foreground">
                            Stock : {product.stock}
                          </p>
                          {product.description && (
                            <p className="text-sm mt-2 text-muted-foreground line-clamp-2">
                              {product.description}
                            </p>
                          )}
                        </CardContent>

                        {/* ✅ ปุ่มล่างขวา */}
                        <div className="absolute bottom-2 right-2 flex gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleEditClick(product)}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDeleteClick(product)}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product "{productToDelete?.name}
              ". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Make changes to your product here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Name
              </label>
              <Input
                id="name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="col-span-3"
              />
            </div>
            {editedPromotion && (
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="beforePrice" className="text-right">
                  Before Price
                </label>
                <Input
                  id="beforePrice"
                  type="number"
                  value={beforePrice ?? ""}
                  disabled
                  className="col-span-3 bg-muted cursor-not-allowed"
                />
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="price" className="text-right">
                Price
              </label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={editedPrice}
                onChange={(e) => setEditedPrice(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="stock" className="text-right">
                Stock
              </label>
              <Input
                id="stock"
                type="number"
                step="0.01"
                min="0"
                value={editStock}
                onChange={(e) => setEditStock(e.target.value)}
                className="col-span-3"
              />
            </div>
            {/* Rank Dropdown */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="rank" className="text-right">
                Rank
              </label>
              <select
                id="rank"
                value={editedRank}
                onChange={(e) => setEditedRank(e.target.value)}
                className="col-span-3 border px-3 py-2 rounded-md"
              >
                <option value="">-- Select Rank --</option>
                {ranks.map((rank) => (
                  <option key={rank.id} value={rank.name}>
                    {rank.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Promotion Toggle */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="promotion" className="text-right">
                Promotion
              </label>
              <div className="col-span-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="promotion"
                  checked={editedPromotion}
                  onChange={(e) => setEditedPromotion(e.target.checked)}
                />
                <label htmlFor="promotion">Mark as Promotion</label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right">
                Description
              </label>
              <textarea
                id="description"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="col-span-3 min-h-[80px] px-3 py-2 border rounded-md"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">Image</label>
              <div className="col-span-3">
                <div className="relative flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 h-32 mb-2">
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
                      <p className="text-sm">No image selected</p>
                    </div>
                  )}
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Click to change image
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
