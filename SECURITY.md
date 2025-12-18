# Environment Setup

## Local Development Setup

1. Copy the template file:
   ```bash
   cp backend/src/main/resources/application.properties.template backend/src/main/resources/application.properties
   ```

2. Edit `backend/src/main/resources/application.properties` and add your actual database credentials

3. The file is gitignored, so your credentials won't be committed

## For Production/Deployment

Set these environment variables:
- `SPRING_DATASOURCE_URL` - Your database JDBC URL
- `SPRING_DATASOURCE_USERNAME` - Your database username  
- `SPRING_DATASOURCE_PASSWORD` - Your database password

The application will use environment variables if set, otherwise fall back to values in application.properties.
