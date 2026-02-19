const UNSPLASH_KEY = 'VyoAF7XDq1hh8JVh6ZoP4fAcoMg9ecJg0jKFIsCGP1c';
const EDAMAM_APP_ID = 'cc34b102';
const EDAMAM_APP_KEY = '342f5d75a9b453549d8068ff75236a66';

export async function getProductImage(query) {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&client_id=${UNSPLASH_KEY}&per_page=1`
    );

    const data = await response.json();
    return data.results[0]?.urls?.regular || 'https://via.placeholder.com/400?text=Don+Cerdonio';
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
    return 'https://via.placeholder.com/400?text=Don+Cerdonio';
  }
}

export async function getNutritionData(productName) {
  try {
    const response = await fetch(
      `https://api.edamam.com/api/food-database/v2/parser?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&ingr=${productName}`
    );
    const data = await response.json();
    return data.hints[0]?.food?.nutrients?.ENERC_KCAL || 'N/A';
  } catch (error) {
    console.error('Error fetching nutrition from Edamam:', error);
    return 'N/A';
  }
}