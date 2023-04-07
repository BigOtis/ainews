import { Helmet } from 'react-helmet'

const Meta = ({ title }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <link rel="canonical" href="https://otisfuse.com" />
    </Helmet>
  )
}

export default Meta
