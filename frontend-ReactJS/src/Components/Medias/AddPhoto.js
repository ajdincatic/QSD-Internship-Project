import React, { useState, useEffect } from "react";
import axios from "axios";
import { endpoints, reactRoutes } from "../../constants";
import { AddMedia } from "./AddMedia";
import { ProgressBar } from "../ProgressBar";
import { ErrorModal } from "../ErrorModal";

export const AddPhoto = ({ history }) => {
  const [data, setData] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);
  const [formIsValid, setFormIsValid] = useState(false);
  const [form, setForm] = useState({
    title: {
      elementType: "input",
      elementConfig: {
        type: "text",
        placeholder: "Title",
      },
      value: "",
      validation: {
        required: true,
        minLength: 3,
      },
      valid: false,
      touched: false,
    },
    categories: {
      elementType: "select",
      elementConfig: {
        options: [],
        placeholder: "Category",
      },
      value: "",
      validation: {
        required: true,
      },
      valid: false,
      touched: false,
    },
    image: {
      elementType: "input",
      elementConfig: {
        type: "file",
        placeholder: "Photo",
      },
      value: "",
      fileValue: "",
      validation: {
        required: true,
      },
      valid: false,
      touched: false,
    },
  });

  useEffect(() => {
    axios
      .get("/medias/categories/photos")
      .then((r) => {
        setData(r.data);
      })
      .catch(() => {
        alert("Something went wrong");
      });
  }, []);

  form.categories.elementConfig.options = data.map((x) => {
    return { value: x.id, displayValue: x.title };
  });

  const inputChangedHandler = (event, inputIdentifier) => {
    const updatedform = { ...form };
    const updatedFormElement = { ...updatedform[inputIdentifier] };
    if (updatedFormElement.elementConfig.type === "file")
      updatedFormElement.fileValue = event.target.files[0];

    updatedFormElement.value = event.target.value;
    updatedFormElement.valid = checkValidity(
      updatedFormElement.value,
      updatedFormElement.validation
    );
    updatedFormElement.touched = true;
    updatedform[inputIdentifier] = updatedFormElement;

    let formIsValid = true;
    for (let key in updatedform) {
      formIsValid = updatedform[key].valid && formIsValid;
    }

    setFormIsValid(formIsValid);
    setForm(updatedform);
  };

  const checkValidity = (value, rules) => {
    let isValid = true;

    if (rules.required) {
      isValid = value.trim() !== "" && isValid;
    }

    if (rules.minLength) {
      isValid = value.length > rules.minLength && isValid;
    }

    return isValid;
  };

  const postDataHandler = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("image", form["image"].fileValue);
    formData.append("category_id", form["categories"].value);
    formData.append("title", form["title"].value);

    axios
      .post(endpoints.photos, formData, {
        onUploadProgress: (progressEvent) => {
          setProgress(
            Math.round((progressEvent.loaded / progressEvent.total) * 100)
          );
        },
      })
      .then(() => {
        history.replace(reactRoutes.allPhotos);
      })
      .catch(() => {
        setError(true);
      });
  };

  const handleErrorState = () => {
    setError(false);
    setProgress(0);
  };

  return (
    <>
      {error && (
        <ErrorModal
          message="File is too big."
          handleErrorState={handleErrorState}
        />
      )}
      <AddMedia
        type="photo"
        form={form}
        formIsValid={formIsValid}
        handler={postDataHandler}
        inputChangedHandler={inputChangedHandler}
      />
      {progress > 0 && <ProgressBar progress={progress} />}
    </>
  );
};
