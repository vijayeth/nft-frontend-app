"use client";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

type NFTData = {
  walletAddress: string;
  nfts: number;
};

type NextPageParams = {
  address_hash: string;
  items_count: number;
  value: number;
};

interface FetchResponse {
  holders: NFTData[];
  nextPageParams: NextPageParams | null;
  hasMore: boolean;
}

const fetchNFTData = async (pageParams?: NextPageParams): Promise<FetchResponse> => {
  let url = '/api';

  if (pageParams) {
    const params = new URLSearchParams({
      address_hash: pageParams.address_hash,
      items_count: pageParams.items_count.toString(),
      value: pageParams.value.toString(),
    });
    url += `?${params.toString()}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch NFT data");
  }
  return await response.json();
};

export default function NFTDisplay() {
  const [nftData, setNFTData] = useState<NFTData[]>([]);
  const [nextPageParams, setNextPageParams] = useState<NextPageParams | undefined>(undefined);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { ref, inView } = useInView();

  useEffect(() => {
    const loadMore = async () => {
      if (inView && hasMore && !isLoading && nftData.length < 100) {
        setIsLoading(true);
        try {
          const data = await fetchNFTData(nextPageParams);

          setNFTData(prev => [...prev, ...data.holders]);

          setNextPageParams(data.nextPageParams ?? undefined);
          setHasMore(data.hasMore && nftData.length + data.holders.length < 100);
        } catch (error) {
          console.error("Error fetching NFT data:", error);
          setHasMore(false);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadMore();
  }, [inView, hasMore, nextPageParams, isLoading]);

  return (
    <div className="p-10 ">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-300">Top 100 Wallets</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {nftData.map(({ walletAddress, nfts }, index) => (
          <Card key={`${walletAddress}-${index}`}>
            <CardHeader>
              <h1 className="text overflow-hidden text-slate-200">Wallet </h1>
            </CardHeader>
            <CardContent>
            <h1 className=" text-slate-400 ">{walletAddress.slice(0, 6).toLowerCase() + "......"+ walletAddress.slice(-6).toLowerCase()}</h1>
              <div className="mb-4">
              </div>
              <p className="text-green-500">NFT: {nfts}</p>
            </CardContent>
          </Card>
        ))}
        {(hasMore || isLoading) && (
          <div ref={ref} className="col-span-full text-center">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}