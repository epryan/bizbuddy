const MAXBILLABLES = 5;

var nextId = 1;
function showNextBillable() {
  if (nextId < MAXBILLABLES) {
    var billableId = '#billable_' + nextId;
    //$(billable_id).removeClass('hidden')
    $(billableId).show()
    nextId++;
  }
}

function validateForm() {

  // Collect the subtotals and store them in the hidden invoice_price element
  var subTotals = document.getElementById("form_invoice").elements['total_price'];
  var total = 0;

  for (i = 0; i < subTotals.length; i++) {
    if (subTotals[i] && subTotals[i].value) {
      total += parseFloat(subTotals[i].value);
    }
  }

  document.getElementById("invoice_price").value = total;

  // POST the form to the server
  document.getElementById("form_invoice").submit();
}

function setTotalListeners() {
    for (var i = 0; i < MAXBILLABLES; i++) {
      var id = 'billable_' + i + '_total_price';
      var element = document.getElementById(id);
      element.oninput = updateTotal(i);
    }
}

function updateTotal(idToWatch) {
  var quantity = document.getElementById('billable_' + idToWatch + '_quantity');
  var unitPrice = document.getElementById('billable_' + idToWatch + '_unit_price');
  var totalPrice = document.getElementById('billable_' + idToWatch + '_total_price');
  if (quantity && quantity.value > 0 && unitPrice && unitPrice.value > 0) {
    totalPrice.value = quantity.value * unitPrice.value;
  }
}
