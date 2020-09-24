import React from "react";

const IndexPage = (props) => {
  React.useEffect(() => {
    const token = localStorage.getItem("CC_Token");
    console.log(token);
    if (!token) {
      props.history.push("/register");
    } else {
      props.history.push("/dashboard");
    }
    // eslint-disable-next-line
  }, []);
  return <div></div>;
};

export default IndexPage;
