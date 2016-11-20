function tax(/* base */) {
  return (taxContext, calculateItemTaxes) => {
    let beforeTax, tax;
    if (taxContext.product.isNetPrice) {
      tax = taxContext.taxData.isPercentage
        ? taxContext.item.price * taxContext.taxData.rate / 100
        : taxContext.taxData.rate;
      beforeTax = taxContext.item.price - tax;
    } else {
      beforeTax = taxContext.item.price;
      tax = taxContext.taxData.isPercentage
        ? taxContext.item.price * taxContext.taxData.rate / 100
        : taxContext.taxData.rate;
    }
    const taxDetail = taxContext.taxData.title;

    return { beforeTax, tax, taxDetail };
  };
}

module.exports = tax;
