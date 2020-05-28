FROM tiangolo/meinheld-gunicorn

COPY requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt

COPY app /app
RUN useradd flask && chown -R flask /app
USER flask

WORKDIR /app
EXPOSE 8888
CMD ["gunicorn", "--bind", "0.0.0.0:8888", "app:app"]
