import { Box, Button, TextField, Stack ,Alert } from "@mui/material";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import config from '../config.js';
import axios from 'axios'
import LoadingButton from '@mui/lab/LoadingButton';
import SendIcon from '@mui/icons-material/Send';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TabPanel from './Tabpanel.jsx'
import { JsonView, darkStyles, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

const Home = () => {
  const [output, setOutput] = useState(null)
  const [recipe, setRecipe] = useState(null)
  const [ingredient, setIngredient] = useState([])
  const [loading, setLoading] = useState(false)
  const [recipeSource, setRecipeSource] = useState('')
  const [totalTime, setTotalTime] = useState('')
  const [prep, setPrep] = useState('')
  const [value, setValue] = useState(0);
  const [recipeError, setRecipeError] = useState(false)
  const [ingredientError, setIngredientError] = useState(false)
  const [prepError, setPrepError] = useState(false)
  const [recipeSourceError, setRecipeSourceError] = useState(false)
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const fetchList = () => {
    axios.post(`${config.BASE_URL}analyze/getJsonRecipes`, {headers: { 'Content-Type': 'multipart/form-data' }}).then(async response => {
      if (response.data.recipe.length) {
        response.data.recipe.map((item) => {
          item.totalNutrients = JSON.parse(item.totalNutrients)
        })
        // response.data.recipe.totalNutrients = JSON.parse(response.data.recipe.totalNutrients)
      }
      setOutput(response.data.recipe)
   
    })
  }
  const handleAnalyze = async () => {
    setRecipeError(false)
    setIngredientError(false)
    setPrepError(false)
    setRecipeSourceError(false)

    if (!recipe) {
      setRecipeError(true)
      return
    }
    if (!ingredient.length) {
      setIngredientError(true)
      return
    }
    if (!prep) {
      setPrepError(true)
      return
    }
    if (!recipeSource) {
      setRecipeSourceError(true)
      return
    }
    setLoading(true)
    const res = await axios.post('https://api.edamam.com/api/nutrition-details?app_id=1c990a71&app_key=908ce9412709b67af50c68792f7ef822', {"title" : `${recipe}`, "ingr" : ingredient}, {headers: { 'Content-Type': 'application/json' }})
   
    console.log(res.data)
    
    const result = []
    res.data.ingredients.map((item, i) => {
      const arr = item.parsed.map((el) => {
        return { text: item.text, quantity: el.quantity, measure: el.measure, food: el.food, weight: el.weight, foodCategory: el.foodCategory, foodId: el.foodId, image: el.image }
      })
      result.push(...arr)
    })
    res.data.ingredients = result
    res.data.prep = prep
    res.data.recipeSource = recipeSource
    res.data.label = recipe
    res.data.totalTime = totalTime
    const formData = new FormData()
    formData.append("recipe", JSON.stringify(res.data))
    axios.post(`${config.BASE_URL}analyze`, formData, {headers: { 'Content-Type': 'multipart/form-data' }}).then(async response => {
      if (response.data.recipe.length) {
        response.data.recipe.map((item) => {
          item.totalNutrients = JSON.parse(item.totalNutrients)
        })
        // response.data.recipe.totalNutrients = JSON.parse(response.data.recipe.totalNutrients)
      }
      setOutput(response.data.recipe)
      setLoading(false)
    })
  }

  const downloadJson = () => {
    const json = JSON.stringify(output, null, 2);
    const blob = new Blob([json], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ahara-recipes.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    fetchList()
  }, [])
  return (
    <motion.div>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} centered>
          <Tab label="Name" />
          <Tab label="Json Viewer" />
        </Tabs>
      </Box>
      {
        recipeError ? 
        <Alert severity="error">Please input Recipe.</Alert> : ""
      }
      {
        ingredientError ?
        <Alert severity="error">Please input Ingredient.</Alert> : ""
      }
      {
        prepError ? 
        <Alert severity="error">Please input Preparation Instructions.</Alert> : ""
      }
      {
        recipeSourceError ?
        <Alert severity="error">Please input Recipe Source.</Alert> : ""
      }
      <TabPanel value={value} index={0}>
        <Box mb={3} mt={3} display='flex' justifyContent='center' >
            <TextField variant="outlined" label="Recipe Name" sx={{width: '500px'}} onChange={(e) => setRecipe(e.target.value)} />
        </Box>
        <Box mb={3} display='flex' justifyContent='center' >
          <TextField multiline variant="outlined" label="Ingredients" rows={5} sx={{width: '500px'}} onChange={(e) => setIngredient(e.target.value.split('\n'))} />
        </Box>
        <Box mb={3} display='flex' justifyContent='center' >
          <TextField variant="outlined" label="Total Time" sx={{width: '500px'}} onChange={(e) => setTotalTime(e.target.value)} />
        </Box>

        <Box mb={3} display='flex' justifyContent='center' >
            <TextField multiline  rows={5} variant="outlined" label="Preparation Instructions" sx={{width: '500px'}} onChange={(e) => setPrep(e.target.value)} />
        </Box>
        <Box mb={3} display='flex' justifyContent='center' >
            <TextField variant="outlined" label="Recipe Source" sx={{width: '500px'}} onChange={(e) => setRecipeSource(e.target.value)} />
        </Box>
        <Box display='flex' justifyContent='center'>
          <LoadingButton
            variant="contained" 
            size="large" 
            style={{width: '223px'}}
            onClick={handleAnalyze}
            endIcon={<SendIcon />}
            loading={loading}
            loadingPosition="end"
          >
            <span>Analyze</span>
          </LoadingButton>
        </Box>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Box mt={3} display="flex" justifyContent="end" >
          <Button variant="contained" onClick={downloadJson}>Download JSON</Button>
        </Box>
        <Box mt={3}>
          {
            output?.map((item, i) => 
              <Box mt={1} key={i} >
                <JsonView  data={item} shouldInitiallyExpand={(level) => false} style={defaultStyles} />
              </Box>
            )
          }
        </Box>
      </TabPanel>
    </motion.div>
  );
};

export default Home;
