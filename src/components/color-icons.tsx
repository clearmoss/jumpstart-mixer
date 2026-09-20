function ColorIcons({ packColors }: { packColors: { color: string; count: number }[] }) {
  return packColors.map((color, index) => (
    <img
      src={`/icons/${color.color}.svg`}
      alt={color.color}
      key={color.color}
      className={"select-none " + (index === 0 ? "h-7 w-7" : "h-5 w-5")}
    />
  ));
}

export default ColorIcons;
