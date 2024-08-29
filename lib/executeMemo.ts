export const handler = async ({ memo }: { memo: string }): Promise<void> => {
  // console.log(memo);

  // return Promise.resolve();
  try {
    const response = await fetch(
      "https://api.neatlist.co/api/v1/account/archive-time"
    );

    console.log(response);
  } catch (error) {
    console.error("Error fetching archive time:", error);
  }
};
