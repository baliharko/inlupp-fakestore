$(document).ready(() => {

    const endPoint = 'https://webacademy.se/fakestore/';

    const aboutModal = document.createElement('div');
    let allProducts = [];
    let cart = [];

    aboutModal.innerHTML = 
    `
    <div id="myModal" class="modal fade" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content text-center">
          <div class="modal-header align-self-center">
            <h5 class="modal-title m-2">About</h5>
          </div>
          <div class="modal-body">
            <p class="lead">You won't find a store more fake than this...</p>
            <p class="mx-5 mt-2 mb-4">
              A fake store fetching data from an API and implementing basic
              ecommerce functionality.
            </p>
            <button class="btn btn-outline-secondary" id="exitModal">
              Cool!
            </button>
          </div>
          <div class="modal-footer d-flex justify-content-start">
            <p class="small my-0" style="font-size: xx-small">
              baliharko - 2021
            </p>
          </div>
        </div>
      </div>
    </div
    `;

    document.body.insertAdjacentElement('beforeend', aboutModal);

    load();

    function load() {
        fetch(endPoint)
          .then(response => response.json())
          .then(json => {
            allProducts = json;
            console.log(allProducts);
            render(json)
          })
          .catch(err => console.error(err))
    };

    function render(data) {

        let output = "";
        
        data.forEach((product) => {
            output += `
           <div class="card m-4 p-0" style="width: 22rem">
             <img
               class="card-img-top img-fluid"
               src="${product.image}"
               alt="product image"
             />
             <div class="card-body flex-column d-flex justify-content-between">
                <div>
                   <h5 class="card-title">${product.title}</h5>
                   <p class="card-text small">${product.description}</p>
                </div>
                <div class="d-flex flex-column align-items-center">
                   <p class="lead mt-5 mb-3">${product.price.toFixed(2)} kr</p>
                   <button style="width: 10rem;" class="btn btn-outline-secondary addToCartBtn" id="${product.id}">Add to Cart</button>
                </div>
             </div>
           </div>`;                
          
        });

        $('#productView').html(output);

        $('.addToCartBtn').on('click', function() {                  

          const selected = allProducts.find(item => item.id == this.id);
          cart.push(selected);
          
          let amount = getProductAmount(selected);
          console.log(amount);
          console.log(cart);
        })
    }

    $('#modalButton').click(() => {
      $('#myModal').modal('show');
    });

    $('#exitModal').click(() => {
      $('#myModal').modal('hide');
    });

    function getProductAmount(product) {
      return cart.reduce((acc, val) => (
        val.id === product.id ? acc + 1 : acc 
      ), 0); 
    }
});