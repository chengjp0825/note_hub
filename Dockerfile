FROM nginx@sha256:df221db836e1754089190208cee7eeda94f233197056426eda74a43ab1abeac2

LABEL maintainer="NoteHub-Cheng"

COPY nginx.conf /etc/nginx/nginx.conf
COPY docs/.vitepress/dist /usr/share/nginx/html

USER nginx
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
