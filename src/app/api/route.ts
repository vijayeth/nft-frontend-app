import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const addressHash = searchParams.get("address_hash");
  const itemsCount = searchParams.get("items_count");
  const value = searchParams.get("value");
  const limit = searchParams.get("limit") || "50";

  try {
    let apiUrl = `https://www.shibariumscan.io/api/v2/tokens/0x007Bbf85988cAF18Cf4222C9214e4fa019b3e002/holders?limit=${limit}`;

    if (addressHash && itemsCount && value) {
      apiUrl = `https://www.shibariumscan.io/api/v2/tokens/0x007Bbf85988cAF18Cf4222C9214e4fa019b3e002/holders?address_hash=${addressHash}&items_count=${itemsCount}&value=${value}`;
    }

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch holders data: ${response.statusText}`);
    }

    const data = await response.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const holders = data.items.map((item: any) => ({
      walletAddress: item.address.hash,
      nfts: parseInt(item.value, 10),
    }));

    return NextResponse.json({
      holders,
      nextPageParams: data.next_page_params,
      hasMore: !!data.next_page_params,
    });
  } catch (error) {
    console.error("Error fetching or processing data:", error);
    return NextResponse.json(
      { error: "Failed to fetch or process holders data" },
      { status: 500 }
    );
  }
}
