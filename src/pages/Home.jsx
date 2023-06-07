import { Box, Button, TextField, Stack ,Alert } from "@mui/material";
import { motion } from "framer-motion";
import { useState } from "react";
import config from '../config.js';
import axios from 'axios'
import LoadingButton from '@mui/lab/LoadingButton';
import SendIcon from '@mui/icons-material/Send';
import conversion from './foo.json'

const Home = () => {
  const [quantity, setQuantity] = useState("")
  const [ingredient, setIngredient] = useState(null)
  const [unit, setUnit] = useState(null)
  const [sampleUnits, setSampleUnits] = useState(['teaspoon', 'tsp', 'tablespoon', 'tbsp', 'cup', 'pint', 'pt', 'quart', 'q', 'qt', 'gallon', 'g', 'liter', 'l', 'fluid ounce', 'fl oz', 'milliliter', 'ml', 'gram', 'g', 'ounce', 'oz', 'milligram', 'mg', 'pound', 'lb'])
  const [unitError, setUnitError] = useState(false)
  const [quantityError, setQuantityError] = useState(false)
  const [ingredientError, setIngredientError] = useState(false)
  const [conversionError, setConversionError] = useState(false)
  const [output, setOutput] = useState(null)
  const [loading, setLoading] = useState(false)
  const unitArray = ['teaspoon', 'tablespoon', 'pint', 'quart', 'cup', 'gallon' ,'liter', 'milliliter']
  const tmp = {
    teaspoon: {
      teaspoon: 1,
      tablespoon: 0.33333333,
      pint: 0.01041667,
      quart: 0.00520833,
      cup: 0.02083333,
      gallon: 0.00130208,
      liter: 0.00493213,
      milliliter: 4.932133838
    },
    tablespoon: {
      teaspoon: 3,
      tablespoon: 1,
      pint: 0.03125,
      quart: 0.015625,
      cup: 0.0625,
      gallon: 0.00390625,
      liter: 0.0147964,
      milliliter: 14.79640152
    },
    pint: {
      teaspoon: 96,
      tablespoon: 32,
      pint: 1,
      quart: 0.5,
      cup: 2,
      gallon: 0.125,
      liter: 0.47348485,
      milliliter: 473.4848485
    },
    quart: {
      teaspoon: 192,
      tablespoon: 64,
      pint: 2,
      quart: 1,
      cup: 4,
      gallon: 0.25,
      liter: 0.9469697,
      milliliter: 946.969697
    },
    cup: {
      teaspoon: 48,
      tablespoon: 16,
      pint: 0.5,
      quart: 0.25,
      cup: 1,
      gallon: 0.0625,
      liter: 0.23674242,
      milliliter: 236.7424242
    },
    gallon: {
      teaspoon: 768,
      tablespoon: 256,
      pint: 8,
      quart: 4,
      cup: 16,
      gallon: 1,
      liter: 3.78787879,
      milliliter: 3787.878788
    },
    liter: {
      teaspoon: 202.752,
      tablespoon: 67.584,
      pint: 2.112,
      quart: 1.056,
      cup: 4.224,
      gallon: 0.264,
      liter: 1,
      milliliter: 1000
    },
    milliliter: {
      teaspoon: 0.202752,
      tablespoon: 0.067584,
      pint: 0.002112,
      quart: 0.001056,
      cup: 0.004224,
      gallon: 0.000264,
      liter: 0.001,
      milliliter: 1
    }
  }
  const options = {
    includeScore: true,
    keys: ['label'],
    threshold: 0.8,
  };
  const handleQuantityChange = (e) => {
    const inputValue = e.target.value;

    const regex = /^-?\d*\.?\d*\/?-?\d*\.?\d*$/;
    if (regex.test(inputValue)) {
      console.log(inputValue)
      setQuantity(inputValue);
    }
  };

  const handleAnalyze = () => {
    let _unit = unit;
    if (unit == 'tsp') {
      _unit = 'teaspoon';
    } else if (unit == 'tbsp') {
      _unit = 'tablespoon';
    } else if (unit == 'pt') {
      _unit = 'pint';
    } else if (unit == 'q' || unit == 'qt') {
      _unit = 'quart';
    } else if (unit == 'g') {
      _unit = 'gallon';
    } else if (unit == 'l') {
      _unit = 'liter';
    } else if (unit == 'fl oz') {
      _unit = 'fluid ounce';
    } else if (unit == 'ml') {
      _unit = 'milliliter';
    } else if (unit == 'g') {
      _unit = 'gram';
    } else if (unit == 'oz') {
      _unit = 'ounce';
    } else if (unit == 'mg') {
      _unit = 'milligram';
    } else if (unit == 'lb') {
      _unit = 'pound';
    }
    setUnit(_unit);

    let flag = false
    setUnitError(false)
    setQuantityError(false)
    setIngredientError(false)
    setConversionError(false)
    setOutput(null)
    sampleUnits.forEach(sampleUnit => {
      if (sampleUnit == _unit) {
        flag = true
      }
    });
    if(!flag) {
      setUnitError(true)
      setLoading(false)
      return;
    }
    if (quantity.indexOf("/") > -1) {
      let cal = (quantity.split("/")[0] / quantity.split("/")[1]).toFixed(2);
      setQuantity(cal) 
    }
    if (!ingredient) {
      setIngredientError(true)
      setLoading(false)
      return true
    }
    setLoading(true)
    const formData = new FormData()
    formData.append("ingredient", ingredient)
    axios.post(`${config.BASE_URL}analyze`, formData, {headers: { 'Content-Type': 'multipart/form-data' }}).then(async response => {
      if (response.data.success) {
        setIngredient(response.data.item.label)
        setLoading(false)
        console.log("----->", response.data.item)
        let result = response.data.item
        if (result.measures.findIndex(item => item.label == _unit) > -1) {
          let index = result.measures.findIndex(item => item.label == _unit)
          let multiplier = result.measures[index].weight * quantity / 100
          const res = result.totalNutrients.map(itm => ({ ...itm, quantity: (itm.quantity * multiplier).toFixed(2) }));
          setOutput(res)
        
        } else {
          let flag = false
          let indx = null
          for (let i = 0; i < unitArray.length; i++) {
            if (result.measures.findIndex(a => a.label == unitArray[i]) > -1) {
              flag = true
              indx = result.measures.findIndex(a => a.label == unitArray[i])
              break;
            }
          }
          if (flag) {
            if (unitArray.includes(_unit)) {
              let mul = tmp[_unit][result.measures[indx].label] * quantity * result.measures[indx].weight  / 100
              const res = result.totalNutrients.map(itm => ({ ...itm, quantity: (itm.quantity * mul) }));
              setOutput(res)
            } else {
              try {
                const res = await axios.post('https://api.edamam.com/api/nutrition-details?app_id=1c990a71&app_key=908ce9412709b67af50c68792f7ef822', {"ingr" : [`${quantity} ${_unit} ${ingredient}`]}, {headers: { 'Content-Type': 'application/json' }})
                console.log(res.data.calories)
                const res1 = await axios.post('https://api.edamam.com/api/nutrition-details?app_id=1c990a71&app_key=908ce9412709b67af50c68792f7ef822', {"ingr" : [`${quantity} cup ${ingredient}`]}, {headers: { 'Content-Type': 'application/json' }})
                console.log(res1.data.calories)
                const ratio = res.data.calories / res1.data.calories
                if(ratio) {
                  // let mul = tmp['cup'][result.measures[indx].label] * quantity * result.measures[indx].weight  / 100
                  let m = quantity * ratio * result.measures[indx].weight  / 100 * tmp['cup'][result.measures[indx].label]
                  console.log("m--->",quantity, ratio, result.measures[indx].weight , tmp['cup'][result.measures[indx].label], m)
                  const res2 = result.totalNutrients.map(itm => ({...itm, quantity: (itm.quantity * m)}));
                  setOutput(res2)
                  setLoading(false)
                  return
                } else {
                  setLoading(false)
                  return
                }
              } catch (e) {
                setConversionError(true)
                console.log(e)
              }
            }
          }
        }
      } else {
        setIngredientError(true)
        setLoading(false)
        return
      }
    })
  }

  return (
    <motion.div>
       {
        unitError ?
        <Box mb={3} display='flex' justifyContent='center'>
          <Stack sx={{ width: '800px' }} spacing={2}>
            <Alert severity="error">Please input correct unit</Alert>
          </Stack> 
        </Box> : ""
      }
      {
        quantityError ? 
        <Box mb={3} display='flex' justifyContent='center'>
          <Stack sx={{ width: '800px' }} spacing={2}>
            <Alert severity="error">Please input correct quantity</Alert>
          </Stack> 
        </Box> : ""
      }
      {
        ingredientError ? 
        <Box mb={3} display='flex' justifyContent='center'>
          <Stack sx={{ width: '800px' }} spacing={2}>
            <Alert severity="error">Please input correct ingredient</Alert>
          </Stack> 
        </Box> : ""
      }
      {
        conversionError ? 
        <Box mb={3} display='flex' justifyContent='center'>
          <Stack sx={{ width: '800px' }} spacing={2}>
            <Alert severity="error">Cannot convert current unit</Alert>
          </Stack> 
        </Box> : ""
      }
      <Box mb={3} display='flex' justifyContent='center' >
        <TextField variant="outlined" label="Quantity" value={quantity} onChange={(e) => handleQuantityChange(e)} style={{marginRight: '10px'}} />
        <TextField variant="outlined" label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} style={{marginRight: '10px'}} />
        <TextField variant="outlined" label="Ingredient" value={ingredient} onChange={(e) => setIngredient(e.target.value)} />
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
      <Box>
        {
          output?.map((item) => (
            <>
              <span>{item.label}&nbsp;&nbsp;&nbsp;&nbsp; </span>
              <span style={{fontWeight: 'bold'}} >{item.quantity } </span>
              <span>{item.unit } </span>
              <br/>
            </>
          )) 
        }
      </Box>
    </motion.div>
  );
};

export default Home;
