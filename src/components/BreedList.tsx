import React from "react";
import Select  from 'react-select';
import { ResultType, BreedCategoryType, SelectOption } from './DataTypes';

interface selectionOptionType {
    selectedOptions:SelectOption[];
}



interface BreedSelectPropType {
    options:SelectOption[];
    updateBreed: (selectedOptions:SelectOption, breedCategoryType:BreedCategoryType) => void;
    breedCategoryType: BreedCategoryType;
}


const BreedSelect:React.FC<BreedSelectPropType> = React.memo(( props ) => {
    
    const valueDefault = {label:'', value: ''};

    const [selected, setSelected] = React.useState<SelectOption>(valueDefault);

    const handleChange = (selectedOptions:unknown) => {
        
        setSelected((prev:SelectOption) => selectedOptions as SelectOption);


        props.updateBreed(selectedOptions as SelectOption , props.breedCategoryType);
    }
    
    const options = props.options;
    
    return (<>
                <Select 
                    value={selected}
                    options={options}  
                    onChange={ handleChange }
                />
            </>
    )
})




const getNumberOptions = () => {
    const options:SelectOption[] = [];
    for(let i = 1; i <= 50; ++i) {
        options.push({value:i.toString(), label:i.toString()})
    }
    return options;
}

interface  SelectImagesNumberProps {
    setImageNumber:(selectedOptions:SelectOption) => void;
    imageNumber: SelectOption | undefined;
}


const SelectImagesNumber:React.FC<SelectImagesNumberProps> = React.memo((props) => {
    const initState = {
        label:'10',
        value:'10'
    }
    const [selected, setSelected] = React.useState<SelectOption>(initState);

    const handleChange = ( selectedOptions:unknown )  => {
        
        setSelected((prev:SelectOption) => selectedOptions as SelectOption);

        props.setImageNumber(selectedOptions as SelectOption);
        
    }

    return (<>
            <Select 
                value={selected}
                options={getNumberOptions()}  
                onChange={ handleChange }
            />
        </>
    )
})


interface ViewImagesProps {
    imageResults:any;
}

const ViewImages:React.FC<ViewImagesProps> = ( { imageResults } ) => {
    
    const imageList =  imageResults && imageResults.map((image:string, index:number) => {
        return (<div className="grid-item" key={index}><img src={image} key={index} alt={image} className="responsive"/></div>)
    })
    

    if(!imageResults) {
        return null;
    }

    return (<div className="grid-container">{imageList}</div>)
}


interface BreedListState {
    results:ResultType;
    breeds:SelectOption[];
    subBreeds:SelectOption[];
    selectedBreed?:SelectOption;
    selectedSubBreed?:SelectOption;
    imageNumber?:SelectOption;
    imageResults?:string[];
}

interface BreedListErrorState {
    breedEmpty:boolean;
    subBreedEmpty?:boolean;
    imageNumberEmpty:boolean;
}

const BreedList = () => {

    const initState  = {
        results:{},
        breeds:[],
        subBreeds:[],
        imageNumber:{label:"10", value:"10"}
    }

    const [state, setState] = React.useState<BreedListState>(initState);

    const initErrorState = {
        breedEmpty:false,
        subBreedEmpty:false,
        imageNumberEmpty:false
    }

    const [error, setError] = React.useState<BreedListErrorState>(initErrorState);

    const setImageNumber = ( selectedOptions:unknown)  => {

        setState((pstate:BreedListState) => { 
            return {...pstate, imageNumber:selectedOptions as SelectOption }
        });

    }
    
    const updateBreed = ( selectedOptions:SelectOption , breedCategoryType:BreedCategoryType ) => {

        try {
            
            const subBreeds  = state.results[selectedOptions.value];
            
            const subBreedOptions:SelectOption[] = []
            if(subBreeds) {
                for(let i = 0; i < subBreeds.length; ++i) {
                    subBreedOptions.push({value:subBreeds[i], label:subBreeds[i]})
                }
            }
            
            
            if(breedCategoryType === 'breed') {
                
                setState((pstate:BreedListState) => { 
                    return {...pstate, subBreeds:subBreedOptions,selectedBreed:selectedOptions }
                });

            }else {
                setState((pstate:BreedListState) => { 
                    return {...pstate, selectedSubBreed:selectedOptions }
                });
            }
        }catch(e) {
            console.log(e)
        }
        
    }

    React.useEffect(() => {

        async function fetchCat () {
            const response = await fetch('https://dog.ceo/api/breeds/list/all');
            
            const results = await response.json();
            
            const data:SelectOption =  results.message;
            
            let options:SelectOption[] = [];

            for(let key in data) {
                let o:SelectOption = {value:key, label:key};
                options.push(o);
            }
            
            setState((pstate:any) => { 
                return {...pstate, results:data, breeds:options }
            });
        }

        fetchCat();

    },[])

    const fetchImages = async () => {
        
        const selectedBreed = state.selectedBreed
        const selectedSubBreed = state.selectedSubBreed
        const imageNumber = state.imageNumber
        
        let breedEmpty = (!selectedBreed)  ? true : false;
        let subBreedEmpty = (!selectedSubBreed && state.subBreeds.length > 0)  ? true : false;
        let imageNumberEmpty = (!imageNumber)  ? true : false;
        
        setError((perror:BreedListErrorState) => { 
            return {...perror, breedEmpty:breedEmpty, subBreedEmpty:subBreedEmpty,imageNumberEmpty:imageNumberEmpty }
        });
        

        let url;
        
        let imageNumValue = 0;
        
        if(imageNumber) {
            imageNumValue = parseInt(imageNumber.value);
        }

        if(selectedBreed && selectedSubBreed) {

            url =  `https://dog.ceo/api/breed/${selectedBreed.value}/${selectedSubBreed.value}/images/random/${imageNumValue}`;

        }else if(selectedBreed) {

            url =  `https://dog.ceo/api/breed/${selectedBreed.value}/images/random/${imageNumValue}`;

        }


        if(url) {
            const response = await fetch(url);
            
            const imageResults = await response.json();
            
            setState((pstate:any) => { 
                 return {...pstate, imageResults:imageResults.message}
             });
        }
        
    }


    const breedSelectClass = (error.breedEmpty) ? "input error" : "input";
    const subBreedSelectClass = (error.subBreedEmpty) ? "input error" : "input";
    const imageNumbeErrrorClass = (error.imageNumberEmpty) ? "input error" : "input";
    

    return (<div className="breed-list">
                <div className="bread-wrapper">
                    <div className="control">
                        <div className="label">
                            Breed
                        </div>
                        <div className={`${breedSelectClass}`}>
                            <BreedSelect options={state.breeds} updateBreed={updateBreed} breedCategoryType="breed" />
                        </div>
                    </div>
                    {state.subBreeds.length > 0 &&
                    <div className="control">
                        <div className="label">
                            Sub Breed
                        </div>
                        <div className={`${subBreedSelectClass}`}>
                            <BreedSelect options={state.subBreeds} updateBreed={updateBreed} breedCategoryType="subbreed"  />
                        </div>
                    </div>}
                    <div className="control">
                        <div className="label">
                            Number of Images
                        </div>
                        <div className={`${imageNumbeErrrorClass}`}>
                            <SelectImagesNumber setImageNumber={setImageNumber} imageNumber={state.imageNumber} />
                        </div>
                    </div>
                    
                    <div className="button">
                        <button onClick={() => fetchImages()}>View Images</button>
                    </div>                
                </div>
                <div className="image-view-grid">
                    {state.imageResults && <ViewImages imageResults={state.imageResults} />}
                </div>
            </div>)
}

export default BreedList;


