exports = function(payload){
  
 
  let arg = payload.query.arg;
  let runtime = parseInt(payload.query.runtime);
  
  let rating = parseInt(payload.query.rating);
  let start = payload.query.start;
  let end = payload.query.end;
  let genre = payload.query.genre;

  
  const collection = context.services.get("mongodb-atlas").db("sample_mflix").collection("movies");
  
  
  //aggregation array
  let calledAggregation = [
    {
      $searchBeta: {
        compound: {
          must: [
          	 { search: { 
                  path: ['title','fullplot', 'plot'], 
                  query: arg
                }}   
  	      ]
  	   },        
        highlight: {  path: ['plot', 'fullplot'] }      // changed from path: fullplot
      }},
    {
      $project: {
        title: 1, 
        _id: 0, 
        genres:1,
        runtime:1,
        'imdb.rating':1,
        released: 1,
        year: 1, 
        fullplot: 1, 
        plot:1,
        poster:1,
        score: {  $meta: 'searchScore'}, 
        highlight: {  $meta: 'searchHighlights'}
      }},
    { $limit: 9  }
    ];
  
 
  
  if (start) {
    if (end){
      let releaseStage = {
        "range": {
            "path": "released",
            "gte":  new Date(start),
            "lte":  new Date(end)
        }};
        calledAggregation[0].$searchBeta.compound.must.push(releaseStage);
 
    }
  }
 // END START
 if (genre){
      console.log("GENRE: " + genre);
      let genreStage = {
          "search": {
              "query": genre,
              "path": "genres"
          }};
      calledAggregation[0].$searchBeta.compound.must.push(genreStage);
    }  
  
  if (runtime){
    
    console.log("RUNTIME: " + runtime);
      
    let runtimeStage = {
        "range": {
          "path": "runtime",  
          "gte": 0,
          "lte": runtime
          }};
      calledAggregation[0].$searchBeta.compound.must.push(runtimeStage);
    }
    
    if (rating){
    
      console.log("rating: " + rating);
        
      let ratingStage = {
          "range": {
            "path": "imdb.rating",  
            "gte": rating,
            "lte": 10
            }};
        calledAggregation[0].$searchBeta.compound.must.push(ratingStage);
    }
    
   
    console.log(JSON.stringify(calledAggregation));
  
  return collection.aggregate(calledAggregation).toArray();
  

};


