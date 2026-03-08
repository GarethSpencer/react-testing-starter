import { render, screen } from "@testing-library/react";
import Label from "../../src/components/Label";
import AllProviders from "../AllProviders";
import { LanguageProvider } from "../../src/providers/language/LanguageProvider";
import { Language } from "../../src/providers/language/type";

describe("Label", () => {
  const renderComponent = (language: Language, labelId: string) => {
    render(
      <LanguageProvider language={language}>
        <Label labelId={labelId} />
      </LanguageProvider>,
      { wrapper: AllProviders },
    );
  };

  describe("Given the current lannguage is EN", () => {
    it.each([
      {
        labelId: "welcome",
        text: "Welcome",
      },
      {
        labelId: "new_product",
        text: "New Product",
      },
      {
        labelId: "edit_product",
        text: "Edit Product",
      },
    ])(
      "should display a label with the correct $labelId text of $text",
      ({ labelId, text }) => {
        renderComponent("en", labelId);

        const label = screen.getByText(text);
        expect(label).toBeInTheDocument();
      },
    );
  });

  describe("Given the current lannguage is ES", () => {
    it.each([
      {
        labelId: "welcome",
        text: "Bienvenidos",
      },
      {
        labelId: "new_product",
        text: "Nuevo Producto",
      },
      {
        labelId: "edit_product",
        text: "Editar Producto",
      },
    ])(
      "should display a label with the correct $labelId text of $text",
      ({ labelId, text }) => {
        renderComponent("es", labelId);

        const label = screen.getByText(text);
        expect(label).toBeInTheDocument();
      },
    );
  });

  it("should throw an error when an invalid label id is provided", () => {
    expect(() => renderComponent("en", "invalid")).toThrowError();
  });
});
