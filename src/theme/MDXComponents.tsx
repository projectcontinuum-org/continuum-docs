// Makes the DocBlocks components available in every .md/.mdx page without imports.
import MDXComponents from '@theme-original/MDXComponents';
import {Badge, Badges, Card, CardGrid, Lead, Steps} from '@site/src/components/DocBlocks';

export default {
  ...MDXComponents,
  Badge,
  Badges,
  Card,
  CardGrid,
  Lead,
  Steps,
};
