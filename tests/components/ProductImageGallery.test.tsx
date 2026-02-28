import { render, screen } from "@testing-library/react";
import ProductImageGallery from "../../src/components/ProductImageGallery";

describe("ProductImageGallery", () => {
  it("should not render anything when the url array is empty", () => {
    const { container } = render(<ProductImageGallery imageUrls={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("should render list items when the url array is not empty", () => {
    const imageUrls: string[] = ["First String", "Second String"];
    render(<ProductImageGallery imageUrls={imageUrls} />);

    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(imageUrls.length);

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(imageUrls.length);
    imageUrls.forEach((url, index) => {
      expect(images[index]).toHaveAttribute("src", url);
    });
  });
});
