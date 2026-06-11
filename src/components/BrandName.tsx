import { BRAND_CC_COLOR } from "../utils/theme";

type BrandNameProps = {
  className?: string;
};

export function BrandName({ className = "" }: BrandNameProps) {
  return (
    <span className={`font-normal text-white ${className}`}>
      <span className="font-bold" style={{ color: BRAND_CC_COLOR }}>
        cc
      </span>
      Expedition
    </span>
  );
}
