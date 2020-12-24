import { withUrqlClient } from "next-urql"
import React from "react"
import { NavBar } from "../components/NavBar"
import { createUrqlClient } from "../utils/createUrqlClient"

const Index = () => (
  <>
    <NavBar />
    <div>
      hello world
    </div>
  </>
)

export default withUrqlClient(createUrqlClient)(Index);
