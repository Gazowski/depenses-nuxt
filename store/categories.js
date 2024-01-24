export const useCategoriesStore = defineStore('categories', () => {
      const categories = reactive({});
      const requestUri = 'http://localhost/depenses-api/api';


      async function getAllCategories () {
        categories.value = await fetch(`${requestUri}/categories`)
        .then(response => response.json())
        .then(data => data)
        .catch(error => {
            console.error(`Fetch error: ${error}`);
        });
        // for each category, add it to the categories object, add a new object with category id as key and value 
        // is an object with category name and category keywords
      }

      async function updateCategory (category) {
        // edit category
        await fetch(`api/update/category`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(category)
        }).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            } else {
                console.log('Category updated in database')
            }
        }).catch(error => {
            console.error(`Fetch error: ${error}`);
        });
      }

      return {
        categories,
        getAllCategories,
        updateCategory
      }
  });