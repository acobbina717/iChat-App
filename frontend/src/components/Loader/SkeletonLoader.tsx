import { Skeleton } from "@chakra-ui/react";

interface SkeletonLoaderProps {
  count: number;
  height: string;
  width?: string;
}

const SkeletonLoader = ({ count, height, width }: SkeletonLoaderProps) => {
  return (
    <>
      {[...Array(count)].map((_, idx) => (
        <Skeleton
          key={idx}
          startColor="blackAlpha.400"
          endColor="whiteAlpha.300"
          height={height}
          width={{ base: "full" }}
          borderRadius={4}
        />
      ))}
    </>
  );
};

export default SkeletonLoader;
